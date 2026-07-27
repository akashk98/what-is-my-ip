import { NextRequest, NextResponse } from "next/server";
import type { InvitationPayload } from "@/services/invitations";
import { getInvitationByEditToken, updateInvitation, validateInvitationPayload, isInvitationExpired } from "@/services/invitations.server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ editToken: string }> }) {
  const { editToken } = await params;
  const invitation = await getInvitationByEditToken(editToken);
  if (!invitation) {
    return NextResponse.json({ message: "Invitation not found." }, { status: 404 });
  }

  if (isInvitationExpired(invitation)) {
    return NextResponse.json({ message: "Invitation expired." }, { status: 410 });
  }

  return NextResponse.json({ invitation });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ editToken: string }> }) {
  const { editToken } = await params;
  const body = (await request.json()) as Partial<InvitationPayload>;
  const errors = validateInvitationPayload(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: "Validation failed.", errors }, { status: 422 });
  }

  try {
    const invitation = await updateInvitation(editToken, body);
    return NextResponse.json({ invitation });
  } catch (error) {
    const err = error as Error;
    if (err.message === "not_found") {
      return NextResponse.json({ message: "Invitation not found." }, { status: 404 });
    }
    if (err.message === "expired") {
      return NextResponse.json({ message: "Invitation expired." }, { status: 410 });
    }
    return NextResponse.json({ message: "Unable to update invitation." }, { status: 500 });
  }
}
