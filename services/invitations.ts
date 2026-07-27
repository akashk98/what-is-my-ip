import { isPhoneNumber, isValidUrl, normalizeText } from "@/utils/validators";

export type EventType = "Birthday" | "Marriage" | "Housewarming" | "Anniversary";
export type InvitationTheme = "classic" | "modern" | "pastel" | "dark" | "forest";

export interface InvitationPayload {
  eventType: EventType;
  name: string;
  title: string;
  message: string;
  date: string;
  time: string;
  venue: string;
  mapsUrl?: string;
  contactNumber: string;
  photoDataUrl: string;
  qrCodeDataUrl: string;
  theme: InvitationTheme;
}

export interface InvitationRecord extends InvitationPayload {
  slug: string;
  editToken: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

const EVENT_TYPES: EventType[] = ["Birthday", "Marriage", "Housewarming", "Anniversary"];
const THEMES: InvitationTheme[] = ["classic", "modern", "pastel", "dark", "forest"];

export function getEventTypes() {
  return EVENT_TYPES;
}

export function getInvitationThemes() {
  return THEMES;
}

export function isInvitationExpired(invitation: InvitationRecord) {
  return new Date(invitation.expiresAt).getTime() <= Date.now();
}

export function validateInvitationPayload(payload: Partial<InvitationPayload>) {
  const errors: Record<string, string> = {};
  const name = normalizeText(payload.name ?? "");
  const title = normalizeText(payload.title ?? "");
  const message = normalizeText(payload.message ?? "");
  const venue = normalizeText(payload.venue ?? "");
  const contactNumber = normalizeText(payload.contactNumber ?? "");
  const date = normalizeText(payload.date ?? "");
  const time = normalizeText(payload.time ?? "");
  const eventType = payload.eventType;
  const theme = payload.theme;

  if (!eventType || !EVENT_TYPES.includes(eventType)) {
    errors.eventType = "Please select a valid event type.";
  }

  if (!name) {
    errors.name = "Your name is required.";
  }

  if (!title) {
    errors.title = "Event title is required.";
  }

  if (!message) {
    errors.message = "Please add a message.";
  }

  if (!date) {
    errors.date = "Please select a date.";
  }

  if (!time) {
    errors.time = "Please select a time.";
  }

  if (!venue) {
    errors.venue = "Please add a venue.";
  }

  if (payload.mapsUrl && payload.mapsUrl.length > 0 && !isValidUrl(payload.mapsUrl)) {
    errors.mapsUrl = "Please enter a valid map URL.";
  }

  if (!contactNumber || !isPhoneNumber(contactNumber)) {
    errors.contactNumber = "Please enter a valid contact number.";
  }

  if (!payload.photoDataUrl) {
    errors.photoDataUrl = "Please upload a photo.";
  }

  if (!payload.qrCodeDataUrl) {
    errors.qrCodeDataUrl = "Please upload a QR code image.";
  }

  if (!theme || !THEMES.includes(theme)) {
    errors.theme = "Please choose a design theme.";
  }

  return errors;
}
