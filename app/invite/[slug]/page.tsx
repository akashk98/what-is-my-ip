import type { Metadata } from "next";
import type { InvitationRecord } from "@/services/invitations";
import SiteHeader from "@/components/SiteHeader";
import ThemeProvider from "@/components/invitations/ThemeProvider";
import InvitationHeader from "@/components/invitations/InvitationHeader";
import InvitationHero from "@/components/invitations/InvitationHero";
import InvitationMessage from "@/components/invitations/InvitationMessage";
import InfoCard from "@/components/invitations/InfoCard";
import QRCodeCard from "@/components/invitations/QRCodeCard";
import SummaryCard from "@/components/invitations/SummaryCard";
import ActionButtons from "@/components/invitations/ActionButtons";
import InvitationFooter from "@/components/invitations/InvitationFooter";
import InviteCardShell from "@/components/invitations/InviteCardShell";
import { getInvitationBySlug, isInvitationExpired, sanitizeInvitationForPublic } from "@/services/invitations.server";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation || isInvitationExpired(invitation)) {
    return { title: "Invitation expired | AK World" };
  }

  return {
    title: `${invitation.title} | ${invitation.name}`,
    description: invitation.message,
  };
}

export default async function InvitationPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);

  if (!invitation || isInvitationExpired(invitation)) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <SiteHeader />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-rose-200 bg-white p-10 shadow-sm shadow-rose-50">
            <h1 className="text-3xl font-semibold text-slate-900">Invitation Expired</h1>
            <p className="mt-4 text-sm text-slate-600">This invitation is no longer available. Please contact the host for the latest details.</p>
          </div>
        </div>
      </main>
    );
  }

  const invitationData = sanitizeInvitationForPublic(invitation) as InvitationRecord;
  const origin = process.env.NEXT_PUBLIC_ORIGIN ?? "http://localhost:3000";
  const inviteUrl = `${origin}/invite/${invitationData.slug}`;
  const whatsappText = encodeURIComponent(`You're invited to ${invitationData.title} by ${invitationData.name} on ${invitationData.date} at ${invitationData.time}. View the invitation: ${inviteUrl}`);
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  return (
    <main className="min-h-screen bg-[#F6F8FC] text-slate-900">
      <SiteHeader />
      <ThemeProvider theme={invitationData.theme}>
        <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl flex-col px-4 py-10 sm:px-6 lg:px-8">
          <InviteCardShell className="overflow-hidden">
            <div className="grid gap-8 px-4 py-6 md:px-6 md:py-8 lg:grid-cols-[0.7fr_0.3fr] lg:gap-8">
              <div className="space-y-6">
                <InvitationHeader eventType={invitationData.eventType} theme={invitationData.theme} />
                <InvitationHero
                  title={invitationData.title}
                  photoUrl={
                    invitationData.photoDataUrl ||
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
                  }
                  eventType={invitationData.eventType}
                />
                <InvitationMessage
                  title={invitationData.title}
                  message={invitationData.message}
                  host={invitationData.name}
                  date={invitationData.date}
                  time={invitationData.time}
                />
                <div className="rounded-[28px] border border-[var(--inv-border)] bg-[var(--inv-surface)] p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.2)]">
                  <p className="text-sm uppercase tracking-[0.32em] text-[var(--inv-accent)]">About this event</p>
                  <p className="mt-4 text-base leading-7 text-slate-600">{invitationData.message}</p>
                </div>
              </div>

              <div className="space-y-6 lg:sticky lg:top-8">
                <InfoCard
                  title="Event details"
                  items={[
                    { label: "Venue", value: invitationData.venue, icon: "📍" },
                    { label: "Contact", value: invitationData.contactNumber, icon: "📞" },
                  ]}
                  actionLabel={invitationData.mapsUrl ? "Open Maps" : undefined}
                  actionHref={invitationData.mapsUrl || undefined}
                />
                <QRCodeCard qrCodeUrl={invitationData.qrCodeDataUrl || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80"} />
                <SummaryCard
                  summary={[
                    { label: "Event type", value: invitationData.eventType, icon: "🎈" },
                    { label: "Date", value: invitationData.date, icon: "📅" },
                    { label: "Time", value: invitationData.time, icon: "⏰" },
                    { label: "Venue", value: invitationData.venue, icon: "🏠" },
                  ]}
                />
                <ActionButtons
                  whatsappUrl={whatsappUrl}
                  calendarEvent={{
                    title: invitationData.title,
                    date: invitationData.date,
                    time: invitationData.time,
                    venue: invitationData.venue,
                    description: invitationData.message,
                    url: inviteUrl,
                  }}
                  inviteElementId="invitation-card"
                  shareUrl={inviteUrl}
                />
                <InvitationFooter />
              </div>
            </div>
          </InviteCardShell>
          <div className="fixed inset-x-0 bottom-0 z-30 block border-t border-slate-200 bg-white/95 p-4 backdrop-blur-xl sm:hidden">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-3 rounded-3xl bg-[var(--inv-button)] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[rgba(15,23,42,0.18)] transition hover:bg-[var(--inv-button-hover)]"
              aria-label="Share invitation on WhatsApp"
            >
              <span>💬</span>
              <span>Share this invitation</span>
            </a>
          </div>
        </div>
      </ThemeProvider>
    </main>
  );
}
