"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (res.ok) router.push("/login");
    else alert("Error");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl mb-4">Register</h1>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          className="border p-2 w-full mb-3"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          className="border p-2 w-full mb-3"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="customer">customer</option>
          <option value="supplier">supplier</option>
          <option value="seller">seller</option>
          <option value="admin">admin</option>
        </select>

        <button className="bg-black text-white px-4 py-2 w-full">
          Register
        </button>
      </form>
    </div>
  );
}