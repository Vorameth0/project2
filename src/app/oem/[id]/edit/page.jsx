"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditOEMRequestPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [form, setForm] = React.useState({
    title: "",
    category: "",
    specifications: "",
    quantity: 0,
    budgetMin: 0,
    budgetMax: 0,
    deadline: "",
    status: "open",
  });

  React.useEffect(() => {
    (async () => {
      setErr("");
      try {
        const res = await fetch(`/api/oem-requests/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `GET ${res.status}`);

        setForm({
          title: data.title || "",
          category: data.category || "",
          specifications: data.specifications || "",
          quantity: data.quantity || 0,
          budgetMin: data.budgetMin || 0,
          budgetMax: data.budgetMax || 0,
          deadline: data.deadline ? String(data.deadline).slice(0, 10) : "",
          status: data.status || "open",
        });
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]:
        name === "quantity" || name === "budgetMin" || name === "budgetMax"
          ? Number(value)
          : value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(`/api/oem-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `PATCH ${res.status}`);
      router.push(`/oem/${id}`);
    } catch (e2) {
      setErr(e2.message);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold">Edit OEM Request</h1>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input className="w-full border rounded-xl p-2" name="title" value={form.title} onChange={onChange} placeholder="Title" />
          <input className="w-full border rounded-xl p-2" name="category" value={form.category} onChange={onChange} placeholder="Category" />
          <textarea className="w-full border rounded-xl p-2" name="specifications" value={form.specifications} onChange={onChange} placeholder="Specifications" rows={4} />

          <div className="grid grid-cols-3 gap-2">
            <input className="border rounded-xl p-2" type="number" name="quantity" value={form.quantity} onChange={onChange} placeholder="Quantity" />
            <input className="border rounded-xl p-2" type="number" name="budgetMin" value={form.budgetMin} onChange={onChange} placeholder="Budget Min" />
            <input className="border rounded-xl p-2" type="number" name="budgetMax" value={form.budgetMax} onChange={onChange} placeholder="Budget Max" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input className="border rounded-xl p-2" type="date" name="deadline" value={form.deadline} onChange={onChange} />
            <select className="border rounded-xl p-2" name="status" value={form.status} onChange={onChange}>
              <option value="open">open</option>
              <option value="negotiating">negotiating</option>
              <option value="confirmed">confirmed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>

          <button className="w-full rounded-xl bg-black px-4 py-2 text-white">Save</button>
        </form>
      </div>
    </div>
  );
}