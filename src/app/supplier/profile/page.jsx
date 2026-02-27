"use client";

import { useEffect, useState } from "react";

export default function SupplierProfilePage() {
  const [form, setForm] = useState({
    categoriesText: "",
    minimumOrderQuantity: 1,
    capacityPerMonth: 1,
    leadTimeDays: 1,
  });
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setErr(""); setMsg(""); setLoading(true);
    try {
      const res = await fetch("/api/supplier-profiles", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `GET ${res.status}`);

      const item = data?.item;
      if (item) {
        setVerified(Boolean(item.verified));
        setForm({
          categoriesText: (item.categories || []).join(", "),
          minimumOrderQuantity: item.minimumOrderQuantity ?? 1,
          capacityPerMonth: item.capacityPerMonth ?? 1,
          leadTimeDays: item.leadTimeDays ?? 1,
        });
      }
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      const categories = form.categoriesText
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/supplier-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories,
          minimumOrderQuantity: Number(form.minimumOrderQuantity),
          capacityPerMonth: Number(form.capacityPerMonth),
          leadTimeDays: Number(form.leadTimeDays),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `POST ${res.status}`);

      setMsg("Saved!");
      await load();
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Supplier Profile</h1>

        {loading && <p className="mt-4 text-sm text-gray-600">Loading...</p>}
        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        {msg && <p className="mt-4 text-sm text-green-700">{msg}</p>}

        <div className="mt-4 rounded-xl border p-4 text-sm">
          <b>Verified:</b>{" "}
          <span className={verified ? "text-green-700" : "text-gray-600"}>
            {verified ? "Yes" : "No"}
          </span>
          {!verified && (
            <div className="mt-1 text-xs text-gray-500">
              (Admin needs to verify you)
            </div>
          )}
        </div>

        <form onSubmit={save} className="mt-5 grid gap-4">
          <div>
            <label className="text-sm font-medium">Categories (comma separated)</label>
            <input
              className="mt-1 w-full rounded-xl border p-3"
              value={form.categoriesText}
              onChange={(e) => setForm({ ...form, categoriesText: e.target.value })}
              placeholder="e.g. cosmetics, packaging, electronics"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">MOQ</label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border p-3"
                value={form.minimumOrderQuantity}
                onChange={(e) => setForm({ ...form, minimumOrderQuantity: e.target.value })}
                min={1}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Capacity / month</label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border p-3"
                value={form.capacityPerMonth}
                onChange={(e) => setForm({ ...form, capacityPerMonth: e.target.value })}
                min={1}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Lead time (days)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border p-3"
                value={form.leadTimeDays}
                onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
                min={1}
              />
            </div>
          </div>

          <button className="rounded-xl bg-black px-5 py-3 text-white">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}