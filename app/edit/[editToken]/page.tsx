import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import EditInvitationPage from "@/components/invitations/EditInvitationPage";

interface PageProps {
  params: {
    editToken: string;
  };
}

export const metadata: Metadata = {
  title: "Edit Invitation | AK World",
  description: "Edit your digital invitation with a secure token.",
};

export default function EditPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <EditInvitationPage token={params.editToken} />
      </div>
    </main>
  );
}
