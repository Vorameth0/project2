import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "email and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "password must be at least 6 characters" }, { status: 400 });
    }

    await dbConnect();

    const exist = await User.findOne({ email }).lean();
    if (exist) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // default role เป็น customer (ตามงานส่วนใหญ่)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer",
    });

    return NextResponse.json(
      { ok: true, user: { id: String(user._id), name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}