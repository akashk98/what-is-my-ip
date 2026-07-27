import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import AdminPanel from "@/components/invitations/AdminPanel";

export const metadata: Metadata = {
  title: "Admin | AK World Invitations",
  description: "Manage active invitations with password protection.",
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminPanel />
      </div>
    </main>
  );
}
