"use client";

import { useEffect, useState } from "react";

export default function AdminSuppliersPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr(""); setLoading(true);
    try {
      const res = await fetch("/api/supplier-profiles", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `GET ${res.status}`);
      setItems(data?.items || []);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function toggleVerify(profileId, current) {
    const res = await fetch(`/api/supplier-profiles/${profileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: !current }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Update failed");
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Verify Suppliers</h1>
          <a className="rounded-xl border px-4 py-2" href="/dashboard">Back</a>
        </div>

        {loading && <p className="mt-4 text-sm text-gray-600">Loading...</p>}
        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

        <div className="mt-5 space-y-3">
          {items.map((p) => (
            <div key={p._id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">Profile: {p._id}</div>
                  <div className="text-sm text-gray-600">
                    Categories: {(p.categories || []).join(", ") || "-"}
                  </div>
                  <div className="text-sm text-gray-600">
                    MOQ: {p.minimumOrderQuantity} • Capacity/mo: {p.capacityPerMonth} • Lead time: {p.leadTimeDays} days
                  </div>
                </div>

                <button
                  onClick={() => toggleVerify(p._id, p.verified)}
                  className="rounded-xl bg-black px-4 py-2 text-white"
                >
                  {p.verified ? "Unverify" : "Verify"}
                </button>
              </div>

              <div className="mt-2 text-xs">
                Status:{" "}
                <span className={p.verified ? "text-green-700" : "text-gray-600"}>
                  {p.verified ? "Verified" : "Not verified"}
                </span>
              </div>
            </div>
          ))}

          {!loading && items.length === 0 && (
            <p className="text-sm text-gray-600">No supplier profiles yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}