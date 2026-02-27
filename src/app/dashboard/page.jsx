import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-3 text-sm text-red-600">
            No session found. Please login again.
          </p>
          <a className="mt-4 inline-block rounded-xl bg-black px-4 py-2 text-white" href="/login">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <div className="mt-4 rounded-xl border p-4 text-sm">
          <div><b>Name:</b> {session.user?.name}</div>
          <div><b>Email:</b> {session.user?.email}</div>
          <div><b>Role:</b> {session.user?.role}</div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <a className="rounded-xl border bg-white px-4 py-2" href="/oem">OEM Requests</a>
          <a className="rounded-xl border bg-white px-4 py-2" href="/api/auth/signout">Sign out</a>
        </div>
      </div>
    </div>
  );
}