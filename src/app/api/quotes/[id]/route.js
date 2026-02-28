import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import dbConnect from "@/lib/dbConnect";
import Quote from "@/models/Quote";
import OEMRequest from "@/models/OEMRequest";
import { authOptions } from "@/lib/auth";

function badRequest(msg) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function PATCH(req, ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await ctx.params; // ✅ Next 16: params เป็น Promise
  const id = params?.id;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid id");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const { status } = body;
  if (!["accepted", "rejected", "pending"].includes(status)) return badRequest("Invalid status");

  const role = session.user.role;
  const userId = session.user.id;

  await dbConnect();

  const quote = await Quote.findById(id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const oem = await OEMRequest.findById(quote.oemRequestId).lean();
  if (!oem) return NextResponse.json({ error: "OEM request not found" }, { status: 404 });

  // สิทธิ์ตัดสินใจ: customer(เจ้าของงาน) หรือ admin เท่านั้น
  if (role === "customer" && String(oem.createdBy) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (role !== "customer" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  quote.status = status;
  await quote.save();

  const populated = await Quote.findById(id).populate("supplier", "name email role").lean();
  return NextResponse.json({ ok: true, item: populated });
}

export async function DELETE(req, ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await ctx.params; // ✅ Next 16
  const id = params?.id;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid id");

  const role = session.user.role;
  const userId = session.user.id;

  await dbConnect();

  const quote = await Quote.findById(id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ลบได้: admin หรือ supplier เจ้าของ quote
  if (role !== "admin" && String(quote.supplier) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Quote.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}