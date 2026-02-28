// /Users/voramethlaorrattanasak/project_2/src/app/api/oem-requests/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect"; // ใช้ตัวเดียวกับ route อื่น ๆ ให้ชัวร์
import OEMRequest from "@/models/OEMRequest";
import User from "@/models/User";

async function resolveUser(session) {
  // 1) พยายามเอาจาก session ก่อน
  const sUser = session?.user || {};
  let id = sUser.id || sUser._id || null;
  let role = sUser.role || null;

  // 2) ถ้า id เป็น ObjectId ที่ถูกต้อง ใช้ได้เลย
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    return { userId: String(id), role };
  }

  // 3) fallback: ใช้ email ไปหาใน DB เพื่อเอา _id ที่แท้จริง
  const email = sUser.email;
  if (!email) return { userId: null, role };

  await dbConnect();
  const u = await User.findOne({ email }).select("_id role").lean();
  if (!u) return { userId: null, role };

  return {
    userId: String(u._id),
    role: role || u.role || null,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ต่อ DB
  await dbConnect();

  const { userId, role } = await resolveUser(session);
  if (!role) return NextResponse.json({ error: "Missing role in session" }, { status: 400 });

  // ✅ filter ให้เชื่อมกันตาม role
  // - admin เห็นทั้งหมด (แต่ไม่เอา cancelled เพื่อให้กดลบแล้ว “หาย” จาก list)
  // - customer เห็นของตัวเอง (และไม่เอา cancelled)
  // - supplier เห็นงานที่เปิด/กำลังคุย (ของทุก customer)
  const filter = {};

  if (role === "customer") {
    if (!userId) return NextResponse.json({ error: "Missing userId in session" }, { status: 400 });
    filter.createdBy = userId;

    // ✅ เพิ่มแค่นี้: ซ่อนงานที่ถูกยกเลิก/ลบแบบ soft delete
    filter.status = { $ne: "cancelled" };
  }

  if (role === "supplier") {
    filter.status = { $in: ["open", "negotiating"] };
  }

  if (role === "admin") {
    // ✅ เพิ่มแค่นี้: admin ก็ไม่ต้องเห็น cancelled ใน list (ถ้าจะมีหน้า archive ค่อยทำเพิ่ม)
    filter.status = { $ne: "cancelled" };
  }

  const items = await OEMRequest.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, role } = await resolveUser(session);
  if (!role) return NextResponse.json({ error: "Missing role in session" }, { status: 400 });

  // ให้สร้างได้เฉพาะ customer/admin (เดิม)
  if (role !== "customer" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const required = ["title", "category", "specifications", "quantity", "budgetMin", "budgetMax", "deadline"];
  for (const k of required) {
    if (body[k] === undefined || body[k] === "") {
      return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
    }
  }

  await dbConnect();
  const doc = await OEMRequest.create({
    ...body,
    status: "open",
    createdBy: userId || session.user.id || session.user._id, // ✅ กันหลุด
  });

  return NextResponse.json({ id: doc._id.toString() }, { status: 201 });
}