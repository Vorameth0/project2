"use client";

import { useEffect, useState } from "react";

export default function OEMListPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    try {
      const res = await fetch("/api/oem-requests", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `GET ${res.status}`);
      setItems(data?.items || []);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">OEM Requests</h1>
          <a className="rounded-xl bg-black px-4 py-2 text-white" href="/oem/create">Create</a>
        </div>

        {loading && <p className="mt-4 text-sm text-gray-600">Loading...</p>}
        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

        <div className="mt-5 space-y-3">
          {items.map((it) => (
            <a key={it._id} href={`/oem/${it._id}`} className="block rounded-xl border p-4 hover:bg-gray-50 dark:hover:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="font-medium">{it.title}</div>
                <span className="text-xs rounded-full border px-2 py-1">{it.status}</span>
              </div>
              <div className="mt-1 text-sm text-gray-600">{it.category} • qty {it.quantity}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}