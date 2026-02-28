"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

function FieldLabel({ children }) {
  return (
    <span className="absolute -top-2 left-4 bg-[#0b1b3a] px-2 text-xs text-white/60">
      {children}
    </span>
  );
}

export default function EditOEMRequestPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");

  // === fields (ตามหน้าที่คุณโชว์อยู่) ===
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [specifications, setSpecifications] = React.useState("");
  const [quantity, setQuantity] = React.useState(0);
  const [budgetMin, setBudgetMin] = React.useState(0);
  const [budgetMax, setBudgetMax] = React.useState(0);
  const [deadline, setDeadline] = React.useState(""); // yyyy-mm-dd
  const [status, setStatus] = React.useState("open");

  // โหลดข้อมูลเดิม
  React.useEffect(() => {
    if (!id) return;

    (async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await fetch(`/api/oem-requests/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `GET ${res.status}`);

        setTitle(data.title ?? "");
        setCategory(data.category ?? "");
        setSpecifications(data.specifications ?? "");
        setQuantity(Number(data.quantity ?? 0));
        setBudgetMin(Number(data.budgetMin ?? 0));
        setBudgetMax(Number(data.budgetMax ?? 0));
        setStatus(data.status ?? "open");

        // deadline ให้เป็น yyyy-mm-dd สำหรับ input type="date"
        if (data.deadline) {
          const d = new Date(data.deadline);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          setDeadline(`${yyyy}-${mm}-${dd}`);
        } else {
          setDeadline("");
        }
      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function save() {
    if (!id) return;

    setErr("");
    setSaving(true);
    try {
      const body = {
        title,
        category,
        specifications,
        quantity: Number(quantity),
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        status,
      };

      const res = await fetch(`/api/oem-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `PATCH ${res.status}`);

      router.push(`/oem/${id}`);
      router.refresh();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-4xl bg-[#0b1b3a] text-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Edit OEM Request</h1>
          <Link
            href={`/oem/${id}`}
            className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition"
          >
            ← Back
          </Link>
        </div>

        {err && <div className="text-red-400 text-sm mb-4">{err}</div>}

        <div className="space-y-4">
          {/* Title */}
          <div className="relative">
            <FieldLabel>Title</FieldLabel>
            <input
              className="w-full border border-white/20 bg-white/5 rounded-2xl p-3 text-white placeholder-white/40"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <FieldLabel>Category</FieldLabel>
            <input
              className="w-full border border-white/20 bg-white/5 rounded-2xl p-3 text-white placeholder-white/40"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
            />
          </div>

          {/* Specifications */}
          <div className="relative">
            <FieldLabel>Specifications</FieldLabel>
            <textarea
              className="w-full min-h-[180px] border border-white/20 bg-white/5 rounded-2xl p-3 text-white placeholder-white/40"
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder="Specifications"
            />
          </div>

          {/* 3 ช่องตัวเลขแถวเดียว (ตามที่คุณมี 0 0 0) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="relative">
              <FieldLabel>Quantity</FieldLabel>
              <input
                className="w-full border border-white/20 bg-white/5 rounded-2xl p-3 text-white placeholder-white/40"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </div>

            <div className="relative">
              <FieldLabel>Budget Min</FieldLabel>
              <input
                className="w-full border border-white/20 bg-white/5 rounded-2xl p-3 text-white placeholder-white/40"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </div>

            <div className="relative">
              <FieldLabel>Budget Max</FieldLabel>
              <input
                className="w-full border border-white/20 bg-white/5 rounded-2xl p-3 text-white placeholder-white/40"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </div>
          </div>

          {/* Deadline + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <FieldLabel>Deadline</FieldLabel>
              <input
                type="date"
                className="w-full border border-white/20 bg-white/5 rounded-2xl p-3 text-white placeholder-white/40"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="relative">
              <FieldLabel>Status</FieldLabel>
              <select
                className="w-full border border-white/20 bg-white/5 rounded-2xl p-3 text-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option className="text-black" value="open">
                  open
                </option>
                <option className="text-black" value="negotiating">
                  negotiating
                </option>
                <option className="text-black" value="closed">
                  closed
                </option>
              </select>
            </div>
          </div>

          {/* Save */}
          <button
            className="w-full mt-2 rounded-2xl bg-white text-black py-3 font-medium disabled:opacity-60"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}