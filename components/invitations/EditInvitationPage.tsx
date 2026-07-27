"use client";

import { useEffect, useState } from "react";
import InvitationForm from "./InvitationForm";
import type { InvitationPayload } from "@/services/invitations";

interface EditInvitationPageProps {
  token: string;
}

export default function EditInvitationPage({ token }: EditInvitationPageProps) {
  const [initialValues, setInitialValues] = useState<Partial<InvitationPayload> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvitation() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/invitations/edit/${token}`);
        if (!response.ok) {
          const payload = await response.json();
          setError(payload?.message ?? "Unable to load invitation.");
          return;
        }
        const payload = await response.json();
        setInitialValues(payload.invitation);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [token]);

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-700 shadow-sm shadow-slate-100">Loading invitation details…</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 shadow-sm shadow-rose-100">{error}</div>;
  }

  if (!initialValues) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Edit invitation</h1>
        <p className="mt-2 text-sm text-slate-600">Update the event details, replace any images, and save changes securely.</p>
      </div>
      <InvitationForm apiPath={`/api/invitations/edit/${token}`} method="PUT" initialValues={initialValues} submitLabel="Update invitation" />
    </div>
  );
}
