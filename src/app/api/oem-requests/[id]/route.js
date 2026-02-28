import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import OEMRequest from "@/models/OEMRequest";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

function badRequest(msg) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function GET(req, { params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid id");

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const doc = await OEMRequest.findById(id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = session.user.role;
  const userId = session.user.id;

  if (role === "customer" && String(doc.createdBy) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(doc);
}

export async function PATCH(req, { params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid id");

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  const userId = session.user.id;

  if (role !== "customer" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const allowed = ["title", "category", "specifications", "quantity", "budgetMin", "budgetMax", "deadline", "status"];

  const update = {};
  for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];

  await dbConnect();

  const doc = await OEMRequest.findById(id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (role === "customer" && String(doc.createdBy) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  Object.assign(doc, update);
  await doc.save();

  return NextResponse.json({ ok: true, item: doc });
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid id");

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  const userId = session.user.id;

  if (role !== "customer" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();

  const doc = await OEMRequest.findById(id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (role === "customer" && String(doc.createdBy) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  doc.status = "cancelled";
  await doc.save();

  return NextResponse.json({ ok: true });
}