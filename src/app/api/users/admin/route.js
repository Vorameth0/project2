import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  // หา admin จริง ๆ
  const admin = await User.findOne({ role: "admin" }).select("_id").lean();

  if (!admin) {
    // สำคัญ: อย่าคืนค่าเป็น id ตัวเอง ไม่งั้น chat จะส่งหาตัวเองแล้ว error
    return NextResponse.json(
      { error: "Admin user not found (no role=admin in users collection)" },
      { status: 404 }
    );
  }

  return NextResponse.json({ adminId: String(admin._id) });
}