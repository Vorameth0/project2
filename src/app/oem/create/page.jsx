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

  const inputClass =
    "rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-500 " +
    "focus:outline-none focus:ring-2 focus:ring-slate-400 " +
    "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-300";

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow dark:bg-slate-900"
      >
        <h1 className="text-2xl font-semibold">Create OEM Request</h1>
        {err && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{err}</p>}

        <div className="mt-5 grid gap-4">
          <input
            className={inputClass}
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            className={inputClass}
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <textarea
            className={inputClass}
            placeholder="Specifications"
            rows={6}
            value={form.specifications}
            onChange={(e) => setForm({ ...form, specifications: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className={inputClass}
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
            <input
              type="date"
              className={inputClass}
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className={inputClass}
              placeholder="Budget Min"
              value={form.budgetMin}
              onChange={(e) => setForm({ ...form, budgetMin: Number(e.target.value) })}
            />
            <input
              type="number"
              className={inputClass}
              placeholder="Budget Max"
              value={form.budgetMax}
              onChange={(e) => setForm({ ...form, budgetMax: Number(e.target.value) })}
            />
          </div>
        </div>

        <button className="mt-6 rounded-xl bg-black px-5 py-3 text-white dark:bg-white dark:text-black">
          Create
        </button>
      </form>
    </div>
  );
}