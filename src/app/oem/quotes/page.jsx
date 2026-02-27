"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OEMQuotesIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/oem");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Redirecting…</h1>
        <p className="mt-2 text-sm text-gray-600">
          เลือก OEM request ก่อน แล้วเข้า /oem/&lt;id&gt;/quotes
        </p>
      </div>
    </div>
  );
} 
