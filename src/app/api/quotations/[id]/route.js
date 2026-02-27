import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Quotation from "@/models/Quotation";
import OEMRequest from "@/models/OEMRequest";

export async function PATCH(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();

  if (!["accepted", "rejected"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await dbConnect();

  const quote = await Quotation.findById(id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const oem = await OEMRequest.findById(quote.oemRequestId);
  if (!oem) return NextResponse.json({ error: "OEM not found" }, { status: 404 });

  const role = session.user.role;
  const userId = session.user.id;

  // customer ทำได้เฉพาะ OEM ของตัวเอง, admin ได้หมด
  if (role === "customer" && String(oem.createdBy) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (role !== "customer" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  quote.status = body.status;
  await quote.save();

  // ถ้า accept -> OEM เป็น confirmed
  if (body.status === "accepted") {
    oem.status = "confirmed";
    await oem.save();
  }

  return NextResponse.json({ ok: true, status: quote.status });
}
