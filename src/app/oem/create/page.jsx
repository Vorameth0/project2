"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OEMCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    category: "",
    specifications: "",
    quantity: 100,
    budgetMin: 0,
    budgetMax: 0,
    deadline: "",
    attachments: [],
  });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      const res = await fetch("/api/oem-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, deadline: new Date(form.deadline) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Create failed");
      router.push(`/oem/${data.id}`);
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <form onSubmit={onSubmit} className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Create OEM Request</h1>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

        <div className="mt-5 grid gap-4">
          <input className="rounded-xl border p-3" placeholder="Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />

          <input className="rounded-xl border p-3" placeholder="Category" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} />

          <textarea className="rounded-xl border p-3" placeholder="Specifications" rows={6} value={form.specifications}
            onChange={(e) => setForm({ ...form, specifications: e.target.value })} />

          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="rounded-xl border p-3" placeholder="Quantity" value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            <input type="date" className="rounded-xl border p-3" value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="rounded-xl border p-3" placeholder="Budget Min" value={form.budgetMin}
              onChange={(e) => setForm({ ...form, budgetMin: Number(e.target.value) })} />
            <input type="number" className="rounded-xl border p-3" placeholder="Budget Max" value={form.budgetMax}
              onChange={(e) => setForm({ ...form, budgetMax: Number(e.target.value) })} />
          </div>
        </div>

        <button className="mt-6 rounded-xl bg-black px-5 py-3 text-white">Create</button>
      </form>
    </div>
  );
}