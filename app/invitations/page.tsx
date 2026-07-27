import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import InvitationForm from "@/components/invitations/InvitationForm";

export const metadata: Metadata = {
  title: "Create Digital Invitations | AK World",
  description: "Create beautiful digital invitations for birthdays, weddings, anniversaries, and housewarming events.",
};

export default function InvitationsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <InvitationForm />
      </div>
    </main>
  );
}
