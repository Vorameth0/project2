import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Message from "@/models/Message";
import OEMRequest from "@/models/OEMRequest";

function isObjectIdLike(v) {
  return typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (!["customer", "supplier", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const oemRequestId = url.searchParams.get("oemRequestId");
  const withUserId = url.searchParams.get("with");

  if (!isObjectIdLike(oemRequestId) || !isObjectIdLike(withUserId)) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  await dbConnect();

  // ตรวจสิทธิ์แบบปลอดภัย: ต้องเกี่ยวข้องกับ OEM request นั้น
  const oem = await OEMRequest.findById(oemRequestId).select("createdBy").lean();
  if (!oem) return NextResponse.json({ error: "OEM not found" }, { status: 404 });

  const me = session.user.id;

  if (role === "customer" && String(oem.createdBy) !== String(me)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // supplier: อนุญาตเฉพาะ supplier ที่คุยกับ customer ของ request นั้น
  if (role === "supplier") {
    // supplier จะคุยได้แค่กับ customer เจ้าของ request เท่านั้น
    if (String(withUserId) !== String(oem.createdBy)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const items = await Message.find({
    oemRequestId,
    $or: [
      { from: me, to: withUserId },
      { from: withUserId, to: me },
    ],
  })
    .sort({ createdAt: 1 })
    .lean();

  return NextResponse.json({ items });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (!["customer", "supplier", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { oemRequestId, to, text } = body || {};

  if (!isObjectIdLike(oemRequestId) || !isObjectIdLike(to) || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await dbConnect();

  const oem = await OEMRequest.findById(oemRequestId).select("createdBy").lean();
  if (!oem) return NextResponse.json({ error: "OEM not found" }, { status: 404 });

  const me = session.user.id;

  // customer ส่งได้เฉพาะ request ของตัวเอง
  if (role === "customer" && String(oem.createdBy) !== String(me)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // supplier ส่งได้เฉพาะถึง customer เจ้าของ request นั้น
  if (role === "supplier" && String(to) !== String(oem.createdBy)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doc = await Message.create({
    oemRequestId,
    from: me,
    to,
    text: text.trim(),
  });

  return NextResponse.json({ id: doc._id.toString() }, { status: 201 });
}
