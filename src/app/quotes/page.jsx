"use client";

import { useEffect, useState } from "react";

export default function SupplierQuotesPage() {
  const [oems, setOems] = useState([]);
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState({ unitPrice: 0, moq: 1, leadTimeDays: 7, notes: "" });
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function loadOEMs() {
    setErr(""); setMsg("");
    try {
      const res = await fetch("/api/oem-requests", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load OEM failed");
      setOems(data?.items || []);
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");

    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oemRequestId: selected,
          unitPrice: Number(form.unitPrice),
          moq: Number(form.moq),
          leadTimeDays: Number(form.leadTimeDays),
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Create quote failed");
      setMsg("Quotation sent!");
      setForm({ unitPrice: 0, moq: 1, leadTimeDays: 7, notes: "" });
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  useEffect(() => { loadOEMs(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Send Quotation</h1>

        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        {msg && <p className="mt-4 text-sm text-green-700">{msg}</p>}

        <form onSubmit={submit} className="mt-5 grid gap-4">
          <div>
            <label className="text-sm font-medium">Select OEM Request</label>
            <select className="mt-1 w-full rounded-xl border p-3" value={selected} onChange={(e) => setSelected(e.target.value)} required>
              <option value="">-- Choose --</option>
              {oems.map((o) => (
                <option key={o._id} value={o._id}>{o.title} ({o.status})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Unit price</label>
              <input type="number" className="mt-1 w-full rounded-xl border p-3"
                value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium">MOQ</label>
              <input type="number" className="mt-1 w-full rounded-xl border p-3"
                value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} required min={1} />
            </div>
            <div>
              <label className="text-sm font-medium">Lead time (days)</label>
              <input type="number" className="mt-1 w-full rounded-xl border p-3"
                value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })} required min={1} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea className="mt-1 w-full rounded-xl border p-3" rows={5}
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <button className="rounded-xl bg-black px-5 py-3 text-white" disabled={!selected}>
            Send Quotation
          </button>
        </form>
      </div>
    </div>
  );
}