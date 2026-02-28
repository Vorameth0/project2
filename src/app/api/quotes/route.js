import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import dbConnect from "@/lib/dbConnect";
import Quote from "@/models/Quote";
import OEMRequest from "@/models/OEMRequest";
import { authOptions } from "@/lib/auth"; // ✅ ใช้อันนี้ (อย่า import จาก route nextauth)

function badRequest(msg) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const oemRequestId = searchParams.get("oemRequestId");

  if (!oemRequestId || !mongoose.Types.ObjectId.isValid(oemRequestId)) {
    return badRequest("Invalid oemRequestId");
  }

  await dbConnect();

  // เช็คว่า OEMRequest มีจริง
  const oem = await OEMRequest.findById(oemRequestId).lean();
  if (!oem) return NextResponse.json({ error: "OEM request not found" }, { status: 404 });

  const role = session.user.role;
  const userId = session.user.id;

  // สิทธิ์ดู quotes:
  // - customer (owner) และ admin ดูได้หมด
  // - supplier ดูได้ (แนะนำให้ดูได้ทั้งหมดเพื่อ demo)
  // ถ้าอยากให้ supplier เห็นเฉพาะของตัวเอง ค่อยเปลี่ยน filter ด้านล่าง
  if (role === "customer" && String(oem.createdBy) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await Quote.find({ oemRequestId })
    .populate("supplier", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ items });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  const userId = session.user.id;

  // ให้ supplier (หรือ admin) ส่ง quote ได้
  // demo: ให้ทุก role ส่ง quote ได้ (customer/admin/supplier)
if (!["supplier", "admin", "customer"].includes(role)) {
  return NextResponse.json({ error: "Only supplier/admin can create quote" }, { status: 403 });
}

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const { oemRequestId, price, note } = body;

  if (!oemRequestId || !mongoose.Types.ObjectId.isValid(oemRequestId)) {
    return badRequest("Invalid oemRequestId");
  }

  const p = Number(price);
  if (!Number.isFinite(p) || p < 0) return badRequest("Invalid price");

  await dbConnect();

  const oem = await OEMRequest.findById(oemRequestId);
  if (!oem) return NextResponse.json({ error: "OEM request not found" }, { status: 404 });

  const doc = await Quote.create({
    oemRequestId,
    supplier: userId,
    price: p,
    note: String(note || "").trim(),
    status: "pending",
  });

  const populated = await Quote.findById(doc._id).populate("supplier", "name email role").lean();
  return NextResponse.json({ ok: true, item: populated }, { status: 201 });
}