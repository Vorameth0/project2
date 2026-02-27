import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  await dbConnect();

  const existing = await User.findOne({ email: body.email });
  if (existing) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(body.password, 10);

  const user = await User.create({
    name: body.name,
    email: body.email,
    password: hashed,
    role: body.role || "customer",
  });

  return NextResponse.json({ id: user._id });
}