import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import SupplierProfile from "@/models/SupplierProfile";

export async function GET(_req, context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  await dbConnect();
  const doc = await SupplierProfile.findById(id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = session.user.role;
  const userId = session.user.id;

  if (role === "supplier" && String(doc.userId) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (role !== "admin" && role !== "supplier") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ item: doc });
}

export async function PATCH(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await req.json();

  await dbConnect();
  const doc = await SupplierProfile.findById(id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  doc.verified = Boolean(body.verified);
  await doc.save();

  return NextResponse.json({ ok: true, verified: doc.verified });
}