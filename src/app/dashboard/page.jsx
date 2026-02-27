import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow dark:bg-slate-900">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            No session found. Please login again.
          </p>
          <a
            className="mt-4 inline-block rounded-xl bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
            href="/login"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow dark:bg-slate-900">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <div className="mt-4 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700">
          <div>
            <b className="text-slate-900 dark:text-slate-100">Name:</b>{" "}
            <span className="text-slate-700 dark:text-slate-200">{session.user?.name}</span>
          </div>
          <div>
            <b className="text-slate-900 dark:text-slate-100">Email:</b>{" "}
            <span className="text-slate-700 dark:text-slate-200">{session.user?.email}</span>
          </div>
          <div>
            <b className="text-slate-900 dark:text-slate-100">Role:</b>{" "}
            <span className="text-slate-700 dark:text-slate-200">{session.user?.role}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            href="/oem"
          >
            OEM Requests
          </a>
          <a
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            href="/api/auth/signout"
          >
            Sign out
          </a>
        </div>
      </div>
    </div>
  );
}