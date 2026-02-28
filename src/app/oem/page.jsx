"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function OEMListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true); // ✅ เพิ่ม: กัน refresh แล้ว loading ไม่ขึ้น
    try {
      setErr("");
      const res = await fetch("/api/oem-requests", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      setErr(String(e?.message || e)); // ✅ เพิ่ม: กัน e.message พัง
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-4xl bg-[#0b1b3a] text-white rounded-3xl shadow-xl p-8">
        {/* 🔙 ปุ่มย้อนกลับ */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">OEM Requests</h1>

          <Link
            href="/oem/create"
            className="bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 transition"
          >
            Create
          </Link>
        </div>

        {loading && <p>Loading...</p>}
        {err && <p className="text-red-400">{err}</p>}

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="border border-white/20 rounded-2xl p-6 flex justify-between items-center hover:bg-white/5 transition"
            >
              <div>
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="text-gray-300">
                  {item.price} • qty {item.quantity}
                </p>
              </div>

              <Link
                href={`/oem/${item._id}`}
                className="border border-white/30 px-4 py-1 rounded-full hover:bg-white/10 transition"
              >
                open
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}