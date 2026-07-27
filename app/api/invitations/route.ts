import { NextRequest, NextResponse } from "next/server";
import type { InvitationPayload } from "@/services/invitations";
import { createInvitation, validateInvitationPayload } from "@/services/invitations.server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<InvitationPayload>;
  const errors = validateInvitationPayload(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: "Validation failed.", errors }, { status: 422 });
  }

  try {
    const invitation = await createInvitation(body as InvitationPayload);
    return NextResponse.json({ slug: invitation.slug, editToken: invitation.editToken });
  } catch (error) {
    const err = error as Error;
    if (err.message === "capacity_full") {
      return NextResponse.json({ message: "Maximum active invitations reached.", code: "capacity_full" }, { status: 429 });
    }
    return NextResponse.json({ message: "Unable to create invitation." }, { status: 500 });
  }
}
