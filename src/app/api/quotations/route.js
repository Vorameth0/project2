import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Quotation from "@/models/Quotation";
import OEMRequest from "@/models/OEMRequest";
import SupplierProfile from "@/models/SupplierProfile";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const role = session.user.role;
  const userId = session.user.id;

  const url = new URL(req.url);
  const oemRequestId = url.searchParams.get("oemRequestId");

  // filter by role
  let filter = {};
  if (oemRequestId) filter.oemRequestId = oemRequestId;

  if (role === "admin") {
    const items = await Quotation.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ items });
  }

  if (role === "supplier") {
    filter.supplierId = userId;
    const items = await Quotation.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ items });
  }

  if (role === "customer") {
    // customer ดูได้เฉพาะ quotations ที่ผูกกับ OEM ที่ตัวเองสร้าง
    const myOEMs = await OEMRequest.find({ createdBy: userId }).select("_id").lean();
    const ids = myOEMs.map(x => x._id.toString());
    filter.oemRequestId = filter.oemRequestId
      ? filter.oemRequestId
      : { $in: ids };

    const items = await Quotation.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ items });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "supplier" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const required = ["oemRequestId", "unitPrice", "moq", "leadTimeDays", "notes"];
  for (const k of required) {
    if (body[k] === undefined || body[k] === "") {
      return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
    }
  }

  await dbConnect();

  // supplier ต้อง verified ก่อน
  if (session.user.role === "supplier") {
    const profile = await SupplierProfile.findOne({ userId: session.user.id }).lean();
    if (!profile?.verified) {
      return NextResponse.json({ error: "Supplier not verified" }, { status: 403 });
    }
  }

  const oem = await OEMRequest.findById(body.oemRequestId);
  if (!oem) return NextResponse.json({ error: "OEM request not found" }, { status: 404 });

  const supplierId = session.user.role === "admin" && body.supplierId ? body.supplierId : session.user.id;

  const doc = await Quotation.create({
    oemRequestId: body.oemRequestId,
    supplierId,
    unitPrice: Number(body.unitPrice),
    moq: Number(body.moq),
    leadTimeDays: Number(body.leadTimeDays),
    notes: String(body.notes || ""),
    status: "submitted", // pending | accepted | rejected
  });

  // เมื่อมี quotation อย่างน้อย 1 อัน -> เปลี่ยน status เป็น negotiating (ถ้ายัง open)
  if (oem.status === "open") {
    oem.status = "negotiating";
    await oem.save();
  }

  return NextResponse.json({ id: doc._id.toString() }, { status: 201 });
}
