import { createEditToken, createRandomSlug, getCurrentIsoDate } from "@/utils/random";
import { loadRecords, saveRecords } from "@/services/storage";
import {
  InvitationPayload,
  InvitationRecord,
  isInvitationExpired,
  validateInvitationPayload,
} from "@/services/invitations";

export { isInvitationExpired, validateInvitationPayload };

export async function getAllInvitations() {
  return loadRecords<InvitationRecord>();
}

export async function getInvitationBySlug(slug: string) {
  const invitations = await getAllInvitations();
  return invitations.find((invite) => invite.slug === slug) ?? null;
}

export async function getInvitationByEditToken(editToken: string) {
  const invitations = await getAllInvitations();
  return invitations.find((invite) => invite.editToken === editToken) ?? null;
}

export async function listActiveInvitations(search?: string) {
  const all = await getAllInvitations();
  const active = all.filter((invite) => !isInvitationExpired(invite));
  if (!search) return active;

  const query = search.toLowerCase();
  return active.filter((invite) => {
    return (
      invite.slug.toLowerCase().includes(query) ||
      invite.name.toLowerCase().includes(query) ||
      invite.title.toLowerCase().includes(query) ||
      invite.eventType.toLowerCase().includes(query)
    );
  });
}

export async function activeInvitationCount() {
  return (await listActiveInvitations()).length;
}

export async function saveInvitation(invitation: InvitationRecord) {
  const invitations = await getAllInvitations();
  const existing = invitations.findIndex((item) => item.slug === invitation.slug);
  if (existing >= 0) {
    invitations[existing] = invitation;
  } else {
    invitations.push(invitation);
  }
  await saveRecords(invitations);
  return invitation;
}

export async function createInvitation(payload: InvitationPayload) {
  const currentCount = await activeInvitationCount();
  if (currentCount >= 100) {
    throw new Error("capacity_full");
  }

  const invitation: InvitationRecord = {
    ...payload,
    slug: createRandomSlug(),
    editToken: createEditToken(),
    createdAt: getCurrentIsoDate(),
    updatedAt: getCurrentIsoDate(),
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  };

  await saveInvitation(invitation);
  return invitation;
}

export async function updateInvitation(editToken: string, updates: Partial<InvitationPayload>) {
  const invitation = await getInvitationByEditToken(editToken);
  if (!invitation) {
    throw new Error("not_found");
  }
  if (isInvitationExpired(invitation)) {
    throw new Error("expired");
  }

  const updatedInvitation: InvitationRecord = {
    ...invitation,
    ...updates,
    updatedAt: getCurrentIsoDate(),
  };

  await saveInvitation(updatedInvitation);
  return updatedInvitation;
}

export async function deleteInvitation(slug: string) {
  const invitations = await getAllInvitations();
  const filtered = invitations.filter((invite) => invite.slug !== slug);
  await saveRecords(filtered);
}

export async function extendInvitationExpiry(slug: string) {
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) {
    throw new Error("not_found");
  }

  invitation.expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
  invitation.updatedAt = getCurrentIsoDate();
  await saveInvitation(invitation);
  return invitation;
}

export function sanitizeInvitationForPublic(invitation: InvitationRecord) {
  const { editToken, ...publicCopy } = invitation;
  return publicCopy;
}
