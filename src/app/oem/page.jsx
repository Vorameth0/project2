"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">OEM Requests</h1>
          <Link
            href="/oem/create"
            className="rounded-xl bg-black px-4 py-2 text-white"
          >
            Create
          </Link>
        </div>

        {loading && (
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        )}
        {err && (
          <p className="mt-4 text-sm text-red-600">{err}</p>
        )}

        <div className="mt-6 space-y-4">
          {items.map((it) => (
            <div
              key={it._id}
              className="rounded-xl border p-4 hover:bg-gray-50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-medium">
                    {it.title}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {it.category} • qty {it.quantity}
                  </div>
                </div>

                <span className="text-xs rounded-full border px-2 py-1">
                  {it.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/oem/${it._id}`}
                  className="rounded-xl border px-4 py-2 text-sm"
                >
                  View
                </Link>

                <Link
                  href={`/oem/${it._id}/quotes`}
                  className="rounded-xl border px-4 py-2 text-sm"
                >
                  Quotes
                </Link>

                <Link
                  href={`/oem/${it._id}/chat`}
                  className="rounded-xl border px-4 py-2 text-sm"
                >
                  Chat
                </Link>
              </div>
            </div>
          ))}

          {!loading && items.length === 0 && (
            <p className="text-sm text-gray-600">
              No OEM requests yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}