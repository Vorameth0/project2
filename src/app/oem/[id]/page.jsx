"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function OEMDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    if (!id) return;
    setErr("");
    try {
      const res = await fetch(`/api/oem-requests/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `GET ${res.status}`);
      setItem(data?.item);
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  async function cancelRequest() {
    if (!confirm("Cancel this request?")) return;
    const res = await fetch(`/api/oem-requests/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Cancel failed");
    load();
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Request Detail</h1>
          <button className="rounded-xl border px-4 py-2" onClick={() => router.push("/oem")}>Back</button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <a className="rounded-xl border px-4 py-2" href={`/oem//quotes`}>View Quotations</a>
        </div>

        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        {!item && !err && <p className="mt-4 text-sm text-gray-600">Loading...</p>}

        {item && (
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-medium">{item.title}</div>
                <span className="text-xs rounded-full border px-2 py-1">{item.status}</span>
              </div>
              <div className="mt-2 text-sm text-gray-700"><b>Category:</b> {item.category}</div>
              <div className="mt-2 text-sm text-gray-700"><b>Quantity:</b> {item.quantity}</div>
              <div className="mt-2 text-sm text-gray-700"><b>Budget:</b> {item.budgetMin} - {item.budgetMax}</div>
              <div className="mt-2 text-sm text-gray-700"><b>Deadline:</b> {item.deadline ? new Date(item.deadline).toLocaleDateString() : "-"}</div>
              <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap"><b>Specs:</b>{"\n"}{item.specifications}</div>
            </div>

            <button onClick={cancelRequest} className="rounded-xl bg-black px-4 py-2 text-white">
              Cancel Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}