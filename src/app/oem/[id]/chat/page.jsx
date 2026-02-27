"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

export default function OEMChatPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();

  const oemId = params?.id;
  const withUserId = search.get("with") || "";

  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");

  const canLoad = useMemo(() => Boolean(oemId && withUserId), [oemId, withUserId]);

  async function loadMe() {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    const data = await res.json();
    setMe(data?.user || null);
  }

  async function load() {
    if (!canLoad) return;
    setErr("");
    try {
      const res = await fetch(`/api/messages?oemRequestId=${oemId}&with=${withUserId}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load messages failed");
      setItems(data?.items || []);
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  async function send(e) {
    e.preventDefault();
    setErr("");

    const t = text.trim();
    if (!t) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oemRequestId: oemId, to: withUserId, text: t }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Send failed");
      setText("");
      load();
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  useEffect(() => { loadMe(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [canLoad]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Chat</h1>
          <div className="flex gap-2">
            <button className="rounded-xl border px-4 py-2" onClick={() => router.push(`/oem/${oemId}`)}>Back</button>
            <button className="rounded-xl border px-4 py-2" onClick={() => router.push(`/messages`)}>Inbox</button>
          </div>
        </div>

        {!withUserId && (
          <p className="mt-4 text-sm text-gray-600">
            ต้องเข้าแบบนี้: <code className="rounded bg-gray-100 px-2 py-1">/oem/{oemId}/chat?with=USER_ID</code>
          </p>
        )}

        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

        <div className="mt-5 h-[420px] overflow-auto rounded-xl border p-4 bg-gray-50">
          {items.map((m) => {
            const mine = me?.id && String(m.from) === String(me.id);
            return (
              <div key={m._id} className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-black text-white" : "bg-white border"}`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-gray-500"}`}>
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
          {items.length === 0 && <p className="text-sm text-gray-600">No messages yet.</p>}
        </div>

        <form onSubmit={send} className="mt-4 flex gap-2">
          <input
            className="w-full rounded-xl border p-3"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="rounded-xl bg-black px-5 py-3 text-white" disabled={!canLoad}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}