import type { EventType, InvitationPayload, InvitationTheme } from "@/services/invitations";

export const DEFAULT_PHOTO_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'><rect width='800' height='500' fill='%23e2e8f0' /><circle cx='400' cy='220' r='100' fill='%23cbd5e1' /><path d='M200 420c100-120 300-120 400 0' stroke='%239ca3af' stroke-width='30' fill='none' stroke-linecap='round' /><text x='400' y='80' fill='%23626b77' font-family='Arial,Helvetica,sans-serif' font-size='32' text-anchor='middle'>Photo placeholder</text></svg>";

export const DEFAULT_QR_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23f8fafc' /><rect x='40' y='40' width='80' height='80' fill='%234b5563' /><rect x='280' y='40' width='80' height='80' fill='%234b5563' /><rect x='40' y='280' width='80' height='80' fill='%234b5563' /><rect x='130' y='130' width='60' height='60' fill='%234b5563' /><rect x='240' y='130' width='60' height='60' fill='%234b5563' /><rect x='130' y='240' width='60' height='60' fill='%234b5563' /><text x='200' y='360' fill='%239ca3af' font-family='Arial,Helvetica,sans-serif' font-size='24' text-anchor='middle'>QR placeholder</text></svg>";

const BASE_SAMPLE_MESSAGE =
  "We warmly invite you to celebrate this special occasion with us. Your presence will make the event even more memorable. We look forward to celebrating together!";

export const defaultInvitationData: Record<EventType, Partial<InvitationPayload>> = {
  Birthday: {
    eventType: "Birthday",
    name: "John Doe",
    title: "🎉 You're Invited!",
    message: BASE_SAMPLE_MESSAGE,
    date: "2026-12-25",
    time: "18:30",
    venue: "Community Hall, Main Street, Your City",
    mapsUrl: "https://maps.google.com",
    contactNumber: "+91 98765 43210",
    theme: "classic",
  },
  Marriage: {
    eventType: "Marriage",
    name: "John Doe",
    title: "🎉 You're Invited!",
    message: BASE_SAMPLE_MESSAGE,
    date: "2026-12-25",
    time: "18:30",
    venue: "Community Hall, Main Street, Your City",
    mapsUrl: "https://maps.google.com",
    contactNumber: "+91 98765 43210",
    theme: "classic",
  },
  Housewarming: {
    eventType: "Housewarming",
    name: "John Doe",
    title: "🎉 You're Invited!",
    message: BASE_SAMPLE_MESSAGE,
    date: "2026-12-25",
    time: "18:30",
    venue: "Community Hall, Main Street, Your City",
    mapsUrl: "https://maps.google.com",
    contactNumber: "+91 98765 43210",
    theme: "classic",
  },
  Anniversary: {
    eventType: "Anniversary",
    name: "John Doe",
    title: "🎉 You're Invited!",
    message: BASE_SAMPLE_MESSAGE,
    date: "2026-12-25",
    time: "18:30",
    venue: "Community Hall, Main Street, Your City",
    mapsUrl: "https://maps.google.com",
    contactNumber: "+91 98765 43210",
    theme: "classic",
  },
};

export function getDefaultInvitationValues(type: EventType): InvitationPayload {
  const base = defaultInvitationData[type];
  return {
    eventType: base.eventType ?? "Birthday",
    name: base.name ?? "John Doe",
    title: base.title ?? "🎉 You're Invited!",
    message: base.message ?? BASE_SAMPLE_MESSAGE,
    date: base.date ?? "2026-12-25",
    time: base.time ?? "18:30",
    venue: base.venue ?? "Community Hall, Main Street, Your City",
    mapsUrl: base.mapsUrl ?? "https://maps.google.com",
    contactNumber: base.contactNumber ?? "+91 98765 43210",
    photoDataUrl: "",
    qrCodeDataUrl: "",
    theme: base.theme ?? "classic",
  };
}
