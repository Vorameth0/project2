import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

function badRequest(msg) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid id");

  await dbConnect();

  const msg = await Message.findById(id);
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = session.user.role;
  const userId = session.user.id;

  // ลบได้เฉพาะคนส่ง หรือ admin
  if (role !== "admin" && String(msg.from) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Message.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}