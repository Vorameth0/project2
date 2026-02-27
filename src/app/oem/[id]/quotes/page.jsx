"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function OEMQuotesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    if (!id) return;
    setErr("");
    try {
      const res = await fetch(`/api/quotations?oemRequestId=${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load failed");
      setItems(data?.items || []);
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  async function setStatus(qid, status) {
    const res = await fetch(`/api/quotations/${qid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Update failed");
    load();
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Quotations</h1>
          <button className="rounded-xl border px-4 py-2" onClick={() => router.push(`/oem/${id}`)}>
            Back
          </button>
        </div>

        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

        <div className="mt-5 space-y-3">
          {items.map((q) => (
            <div key={q._id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">Supplier: {q.supplierId}</div>
                  <div className="text-sm text-gray-700">
                    Unit price: <b>{q.unitPrice}</b> • MOQ: <b>{q.moq}</b> • Lead time: <b>{q.leadTimeDays} days</b>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{q.notes}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs rounded-full border px-2 py-1">{q.status}</span>
                  <button className="rounded-xl bg-black px-4 py-2 text-white" onClick={() => setStatus(q._id, "accepted")}>
                    Accept
                  </button>
                  <button className="rounded-xl border px-4 py-2" onClick={() => setStatus(q._id, "rejected")}>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-sm text-gray-600">No quotations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}