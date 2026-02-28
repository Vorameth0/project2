// /Users/voramethlaorrattanasak/project_2/src/app/oem/[id]/page.jsx
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

function QuotesBox({ oemRequestId }) {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  // ฟอร์มสร้าง quote (ถ้าไม่ใช่ supplier API จะตอบ Forbidden เราจะโชว์ข้อความ)
  const [price, setPrice] = React.useState("");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // ใช้ flags จากผลลัพธ์จริง (ไม่พึ่ง session provider)
  const [canCreate, setCanCreate] = React.useState(true); // ถ้าโดน 403 ค่อยปิด
  const [canDecide, setCanDecide] = React.useState(true); // (ยังเก็บไว้ เผื่อแสดง error)

  async function load() {
    if (!oemRequestId) return;

    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes?oemRequestId=${oemRequestId}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setItems([]);
          setCanDecide(false);
          throw new Error(data?.error || "Forbidden");
        }
        throw new Error(data?.error || `GET ${res.status}`);
      }

      setItems(data.items || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, [oemRequestId]);

  async function createQuote() {
    setErr("");
    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) return setErr("Price must be a number >= 0");

    setSaving(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oemRequestId,
          price: p,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setCanCreate(false);
          throw new Error("Only supplier (or admin) can create quote.");
        }
        throw new Error(data?.error || `POST ${res.status}`);
      }

      setPrice("");
      setNote("");
      setCanCreate(true);
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id, status) {
    setErr("");
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setCanDecide(false);
          throw new Error("Only customer (owner) or admin can accept/reject.");
        }
        throw new Error(data?.error || `PATCH ${res.status}`);
      }

      setCanDecide(true);
      await load(); // ✅ กดแล้วรีเฟรช ทำให้ทุกคนเห็น status ล่าสุด
    } catch (e) {
      setErr(e.message);
    }
  }

  // (ยังเก็บไว้ แต่เราไม่โชว์ปุ่ม Delete แล้ว ตามที่ขอ)
  async function removeQuote(id) {
    if (!confirm("Delete this quote?")) return;

    setErr("");
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Only quote owner (supplier) or admin can delete.");
        }
        throw new Error(data?.error || `DELETE ${res.status}`);
      }

      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="bg-[#0b1b3a] text-white rounded-3xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Quotes</h2>
        <button className="text-sm underline" onClick={load}>
          Refresh
        </button>
      </div>

      {err && <div className="text-red-400 text-sm mb-2">{err}</div>}

      {/* สร้าง Quote (ถ้าไม่ใช่ supplier จะโดน 403 แล้วเราจะปิดฟอร์ม) */}
      {canCreate && (
        <div className="mb-4 rounded-2xl border border-white/15 p-3">
          <div className="text-sm font-medium mb-2">Send a Quote (Supplier)</div>
          <div className="flex gap-2">
            <input
              className="w-40 border border-white/20 bg-white/5 rounded-2xl p-2 text-white placeholder-white/40"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              inputMode="numeric"
            />
            <input
              className="flex-1 border border-white/20 bg-white/5 rounded-2xl p-2 text-white placeholder-white/40"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
            />
            <button
              className="rounded-2xl bg-white text-black px-4 py-2 disabled:opacity-60"
              onClick={createQuote}
              disabled={saving}
            >
              {saving ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading && <div className="text-white/60">Loading...</div>}

        {!loading && items.length === 0 && <div className="text-white/60">No quotes yet.</div>}

        {items.map((q) => (
          <div key={q._id} className="rounded-2xl border border-white/15 p-4 bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">
                  ฿{Number(q.price).toLocaleString()}
                  <span className="ml-2 text-xs rounded-full border border-white/20 px-2 py-1 text-white/70">
                    {q.status}
                  </span>
                </div>

                {/* ✅ แก้ตามที่ขอ: ไม่โชว์คำว่า Supplier: แล้ว */}
                <div className="text-sm text-white/70 mt-1">
                  {q?.supplier?.name || "unknown"} ({q?.supplier?.email || "-"})
                </div>

                {q.note ? <div className="text-sm mt-2">{q.note}</div> : null}
                <div className="text-xs text-white/50 mt-2">
                  {new Date(q.createdAt).toLocaleString()}
                </div>
              </div>

              {/* ✅ แก้ตามที่ขอ: เอาแค่ปุ่ม Accept/Reject (ไม่ต้องมี Delete) */}
              <div className="flex flex-col gap-2 items-end">
                <div className="flex gap-2">
                  <button
                    className="rounded-2xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                    onClick={() => setStatus(q._id, "accepted")}
                  >
                    Accept
                  </button>
                  <button
                    className="rounded-2xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                    onClick={() => setStatus(q._id, "rejected")}
                  >
                    Reject
                  </button>
                </div>

                {/* (ปุ่ม Delete ถูกถอดออกตามคำขอ) */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatBox({ oemRequestId, adminId }) {
  const [items, setItems] = React.useState([]);
  const [text, setText] = React.useState("");
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  async function load() {
    if (!oemRequestId) return;

    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`/api/messages?oemRequestId=${oemRequestId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `GET ${res.status}`);
      setItems(data.items || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (!oemRequestId) return;
    load();
  }, [oemRequestId]);

  async function send() {
    if (!oemRequestId || !adminId) return;

    setErr("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oemRequestId,
          to: adminId,
          text,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `POST ${res.status}`);

      setText("");
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="bg-[#0b1b3a] text-white rounded-3xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Chat (Customer ↔ Admin)</h2>
        <button className="text-sm underline" onClick={load}>
          Refresh
        </button>
      </div>

      {err && <div className="text-red-400 text-sm mb-2">{err}</div>}

      <div className="border border-white/15 bg-white/5 rounded-2xl p-3 h-64 overflow-auto space-y-3">
        {loading && <div className="text-white/60">Loading...</div>}

        {!loading && items.length === 0 && <div className="text-white/60">No messages yet.</div>}

        {items.map((m) => (
          <div key={m._id} className="text-sm">
            <div className="text-white/50">
              {String(m.from) === String(adminId) ? "Admin" : "You"} •{" "}
              {new Date(m.createdAt).toLocaleString()}
            </div>
            <div>{m.text}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 border border-white/20 bg-white/5 rounded-2xl p-2 text-white placeholder-white/40"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message to admin..."
        />
        <button className="rounded-2xl bg-white text-black px-4 py-2" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}

export default function OEMDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [reqItem, setReqItem] = React.useState(null);
  const [adminId, setAdminId] = React.useState("");
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setErr("");

        const r1 = await fetch(`/api/oem-requests/${id}`, { cache: "no-store" });
        const d1 = await r1.json();
        if (!r1.ok) throw new Error(d1?.error || `GET ${r1.status}`);
        setReqItem(d1);

        const r2 = await fetch("/api/users/admin", { cache: "no-store" });
        const d2 = await r2.json();
        if (!r2.ok) throw new Error(d2?.error || `GET ${r2.status}`);
        setAdminId(d2.adminId);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [id]);

  async function cancel() {
    if (!id) return;
    if (!confirm("Delete this request?")) return;

    setErr("");

    const res = await fetch(`/api/oem-requests/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) return setErr(data?.error || `DELETE ${res.status}`);

    router.replace("/oem");
    router.refresh();
  }

  if (!id) return null;
  if (!reqItem) return <div className="p-6">Loading...</div>;

  const fmtDate = (v) => {
    try {
      return v ? new Date(v).toLocaleString() : "-";
    } catch {
      return "-";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <div>
          <Link
            href="/oem"
            className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition"
          >
            ← Back to OEM List
          </Link>
        </div>

        {err && <div className="text-red-600">{err}</div>}

        <div className="w-full bg-[#0b1b3a] text-white rounded-3xl shadow-xl p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{reqItem.title}</h1>

              <div className="mt-3 space-y-1 text-white/70">
                {reqItem.specifications ? (
                  <div className="text-sm text-white/80">{reqItem.specifications}</div>
                ) : null}

                <div className="text-sm">
                  {reqItem.category ? reqItem.category : "—"} • qty{" "}
                  {reqItem.quantity ?? "—"}
                </div>

                {reqItem.price !== undefined ? (
                  <div className="text-sm">price: {reqItem.price}</div>
                ) : null}

                {reqItem.budgetMin !== undefined || reqItem.budgetMax !== undefined ? (
                  <div className="text-sm">
                    budget: {reqItem.budgetMin ?? "—"} - {reqItem.budgetMax ?? "—"}
                  </div>
                ) : null}

                {reqItem.deadline ? (
                  <div className="text-sm">deadline: {fmtDate(reqItem.deadline)}</div>
                ) : null}

                {reqItem.status ? (
                  <div className="text-sm">status: {reqItem.status}</div>
                ) : null}

                {reqItem.createdAt ? (
                  <div className="text-sm">created: {fmtDate(reqItem.createdAt)}</div>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                className="bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 transition"
                href={`/oem/${id}/edit`}
              >
                Edit
              </Link>

              <button
                className="border border-white/30 px-5 py-2 rounded-full hover:bg-white/10 transition"
                onClick={cancel}
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <QuotesBox oemRequestId={id} />

        <ChatBox oemRequestId={id} adminId={adminId} />
      </div>
    </div>
  );
}