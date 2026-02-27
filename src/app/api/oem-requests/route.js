import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import OEMRequest from "@/models/OEMRequest";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const role = session.user.role;
  const userId = session.user.id;

  let filter = {};
  if (role === "customer") filter.createdBy = userId;
  if (role === "supplier") filter.status = { $in: ["open", "negotiating"] };

  const items = await OEMRequest.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
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
    createdBy: session.user.id,
  });

  return NextResponse.json({ id: doc._id.toString() }, { status: 201 });
}