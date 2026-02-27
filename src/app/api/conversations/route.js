import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Message from "@/models/Message";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (!["customer", "supplier", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();

  const me = session.user.id;

  // ดึงข้อความล่าสุดจำนวนหนึ่งก่อน แล้วค่อย unique เป็นห้องคุย
  const recent = await Message.find({
    $or: [{ from: me }, { to: me }],
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const seen = new Set();
  const items = [];

  for (const m of recent) {
    const other = String(m.from) === String(me) ? String(m.to) : String(m.from);
    const key = `${m.oemRequestId}:${other}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      oemRequestId: String(m.oemRequestId),
      with: other,
      lastText: m.text,
      lastAt: m.createdAt,
    });
  }

  return NextResponse.json({ items });
}