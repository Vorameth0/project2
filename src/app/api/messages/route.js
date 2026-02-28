// /Users/voramethlaorrattanasak/project_2/src/app/api/messages/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import dbConnect from "@/lib/dbConnect";
import { authOptions } from "@/lib/auth";
import Message from "@/models/Message";
import OEMRequest from "@/models/OEMRequest";
import User from "@/models/User";

function badRequest(msg) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

async function getAdminId() {
  const admin = await User.findOne({ role: "admin" }).select("_id").lean();
  return admin?._id ? String(admin._id) : "";
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

  const oem = await OEMRequest.findById(oemRequestId).lean();
  if (!oem) return NextResponse.json({ error: "OEM request not found" }, { status: 404 });

  const role = session.user.role;
  const userId = String(session.user.id);

  // ✅ customer/admin ดูได้เหมือนเดิม
  if (role === "admin") {
    // ok
  } else if (role === "customer") {
    if (String(oem.createdBy) !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (role === "supplier") {
    // ✅ supplier ดู chat ได้ ถ้างานยัง open/negotiating
    if (!["open", "negotiating"].includes(String(oem.status))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await Message.find({ oemRequestId }).sort({ createdAt: 1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const { oemRequestId, text } = body;

  if (!oemRequestId || !mongoose.Types.ObjectId.isValid(oemRequestId)) {
    return badRequest("Invalid oemRequestId");
  }

  const msg = String(text || "").trim();
  if (!msg) return badRequest("Text is required");

  await dbConnect();

  const oem = await OEMRequest.findById(oemRequestId).lean();
  if (!oem) return NextResponse.json({ error: "OEM request not found" }, { status: 404 });

  const role = session.user.role;
  const fromId = String(session.user.id);
  const ownerId = String(oem.createdBy);

  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Admin user not found" }, { status: 500 });

  let toId = "";

  if (role === "customer") {
    if (fromId !== ownerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    toId = adminId;

  } else if (role === "admin") {
    toId = ownerId;

  } else if (role === "supplier") {
    // ✅ supplier ส่งหา admin ได้ ถ้างาน open/negotiating
    if (!["open", "negotiating"].includes(String(oem.status))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    toId = adminId;

  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ✅ แก้ “2 อันนี้”: อนุญาตให้ส่งหาตัวเองได้ทุก role
  // (ไม่ไปแตะกฎสิทธิ์อื่น และไม่กระทบ flow ปกติ)
  // เดิมเคยกันไว้ด้วย: if (toId === fromId) return badRequest("to cannot be yourself");

  const doc = await Message.create({
    oemRequestId,
    from: fromId,
    to: toId,
    text: msg,
  });

  return NextResponse.json({ ok: true, item: doc }, { status: 201 });
}