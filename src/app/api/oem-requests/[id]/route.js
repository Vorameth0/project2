import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import OEMRequest from "@/models/OEMRequest";

export async function GET(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 🔥 แก้ตรงนี้
  const { id } = await context.params;

  await dbConnect();
  const doc = await OEMRequest.findById(id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = session.user.role;
  const userId = session.user.id;

  if (role === "customer" && String(doc.createdBy) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ item: doc });
}

export async function DELETE(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  await dbConnect();
  const doc = await OEMRequest.findById(id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = session.user.role;
  const userId = session.user.id;

  if (role !== "admin" && String(doc.createdBy) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  doc.status = "cancelled";
  await doc.save();

  return NextResponse.json({ ok: true });
}