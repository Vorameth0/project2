"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function OEMCreatePage() {
  const router = useRouter();

  const [err, setErr] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    title: "",
    category: "",
    specifications: "",
    quantity: 1,
    budgetMin: "",
    budgetMax: "",
    deadline: "", // YYYY-MM-DD
  });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    // แปลงเลขให้ชัวร์
    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      specifications: form.specifications.trim(),
      quantity: Number(form.quantity),
      budgetMin: form.budgetMin === "" ? undefined : Number(form.budgetMin),
      budgetMax: form.budgetMax === "" ? undefined : Number(form.budgetMax),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
    };

    if (!payload.title) return setErr("Title is required");
    if (!payload.category) return setErr("Category is required");
    if (!payload.specifications) return setErr("Specifications is required");
    if (!Number.isFinite(payload.quantity) || payload.quantity <= 0) return setErr("Quantity must be > 0");

    setSaving(true);
    try {
      const res = await fetch("/api/oem-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `POST ${res.status}`);

      // รองรับทั้ง {item:{_id}} หรือ {id}
      const id = data?.item?._id || data?._id || data?.id;
      if (id) router.push(`/oem/${id}`);
      else router.push("/oem");
    } catch (e2) {
      setErr(String(e2?.message || e2));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Create OEM Request</h1>
        <p className="mt-1 text-sm text-gray-600">
          Fill in request details (title, category, specifications, quantity, budget range, deadline).
        </p>

        {err && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border p-2"
              placeholder="e.g. Custom bottle manufacturing"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border p-2"
              placeholder="e.g. Packaging / Cosmetics / Food"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Specifications</label>
            <textarea
              name="specifications"
              value={form.specifications}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border p-2"
              rows={5}
              placeholder="Describe size, material, color, logo, etc."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <input
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border p-2"
                min={1}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Budget Min</label>
              <input
                name="budgetMin"
                type="number"
                value={form.budgetMin}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border p-2"
                placeholder="optional"
                min={0}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Budget Max</label>
              <input
                name="budgetMax"
                type="number"
                value={form.budgetMax}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border p-2"
                placeholder="optional"
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Deadline</label>
              <input
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border p-2"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}