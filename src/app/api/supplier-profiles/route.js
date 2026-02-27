import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import SupplierProfile from "@/models/SupplierProfile";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const role = session.user.role;
  const userId = session.user.id;

  if (role === "admin") {
    const items = await SupplierProfile.find({}).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ items });
  }

  if (role !== "supplier") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const item = await SupplierProfile.findOne({ userId }).lean();
  return NextResponse.json({ item });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role !== "supplier" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  await dbConnect();

  const targetUserId = role === "admin" && body.userId ? body.userId : session.user.id;

  const update = {
    userId: targetUserId,
    categories: Array.isArray(body.categories) ? body.categories : [],
    minimumOrderQuantity: Number(body.minimumOrderQuantity || 1),
    capacityPerMonth: Number(body.capacityPerMonth || 1),
    leadTimeDays: Number(body.leadTimeDays || 1),
    // supplier ห้ามตั้ง verified เอง
    verified: false,
  };

  const doc = await SupplierProfile.findOneAndUpdate(
    { userId: targetUserId },
    { $set: update },
    { upsert: true, new: true }
  );

  return NextResponse.json({ id: doc._id.toString() }, { status: 201 });
}