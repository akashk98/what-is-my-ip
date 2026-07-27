"use client";

import { useEffect, useState } from "react";

interface InvitationSummary {
  slug: string;
  eventType: string;
  name: string;
  title: string;
  expiresAt: string;
  createdAt: string;
}

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [search, setSearch] = useState("");
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated) {
      fetchInvitations();
    }
  }, [authenticated]);

  async function fetchInvitations(query = "") {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/invitations/admin${query ? `?search=${encodeURIComponent(query)}` : ""}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });
      if (!response.ok) {
        setAuthenticated(false);
        const payload = await response.json();
        setError(payload?.message || "Unable to load invitations.");
        return;
      }
      const payload = await response.json();
      setInvitations(payload.invitations);
    } catch {
      setError("Unable to connect to admin API.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthenticated(false);
    setError(null);
    try {
      const response = await fetch(`/api/invitations/admin`, {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });
      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.message || "Invalid admin password.");
        return;
      }
      setAuthenticated(true);
      fetchInvitations();
    } catch {
      setError("Unable to connect to admin API.");
    }
  }

  async function performAction(action: "delete" | "extend", slug: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/invitations/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ action, slug }),
      });
      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.message || "Unable to complete action.");
        return;
      }
      await fetchInvitations(search);
    } catch {
      setError("Unable to connect to admin API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <h1 className="text-2xl font-semibold text-slate-900">Admin panel</h1>
        <p className="mt-2 text-sm text-slate-600">Use the environment variable <code>ADMIN_PASSWORD</code> to manage active invitations.</p>
      </div>

      {!authenticated ? (
        <form onSubmit={handleLogin} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm shadow-slate-100">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Admin password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-3xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Continue
            </button>
          </div>
          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm shadow-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Active invitations</h2>
                <p className="mt-1 text-sm text-slate-600">Search, extend expiry, or delete invitations.</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by slug, name, or title"
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <button
                  type="button"
                  onClick={() => fetchInvitations(search)}
                  className="inline-flex items-center justify-center rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
          {loading ? <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">Loading invitations…</div> : null}

          {invitations.length === 0 && !loading ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">No active invitations found.</div>
          ) : null}

          <div className="space-y-4">
            {invitations.map((invite) => (
              <div key={invite.slug} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-base font-semibold text-slate-900">{invite.title}</div>
                    <div className="mt-1 text-sm text-slate-600">{invite.eventType} · {invite.name}</div>
                  </div>
                  <div className="text-sm text-slate-500">Expires {new Date(invite.expiresAt).toLocaleDateString()}</div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <a
                    href={`/invite/${invite.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    View invitation
                  </a>
                  <button
                    type="button"
                    onClick={() => performAction("extend", invite.slug)}
                    className="inline-flex items-center justify-center rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
                  >
                    Extend expiry
                  </button>
                  <button
                    type="button"
                    onClick={() => performAction("delete", invite.slug)}
                    className="inline-flex items-center justify-center rounded-3xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-500"
                  >
                    Delete invitation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
