"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MessagesInbox() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load failed");
      setItems(data?.items || []);
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Messages</h1>

        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

        <div className="mt-5 space-y-3">
          {items.map((c) => (
            <Link
              key={`${c.oemRequestId}-${c.with}`}
              className="block rounded-xl border p-4 hover:bg-gray-50"
              href={`/oem/${c.oemRequestId}/chat?with=${c.with}`}
            >
              <div className="text-sm text-gray-700">
                OEM: <b>{c.oemRequestId}</b>
              </div>
              <div className="mt-1 text-sm text-gray-600 line-clamp-1">{c.lastText}</div>
              <div className="mt-1 text-xs text-gray-500">{new Date(c.lastAt).toLocaleString()}</div>
            </Link>
          ))}

          {items.length === 0 && <p className="text-sm text-gray-600">No conversations yet.</p>}
        </div>
      </div>
    </div>
  );
}