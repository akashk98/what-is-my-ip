import { NextRequest, NextResponse } from "next/server";
import { deleteInvitation, extendInvitationExpiry, listActiveInvitations } from "@/services/invitations.server";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD;
}

function getPasswordFromRequest(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ message }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const adminPassword = getAdminPassword();
  if (!adminPassword) {
    return NextResponse.json({ message: "Admin password not configured." }, { status: 500 });
  }

  if (getPasswordFromRequest(request) !== adminPassword) {
    return unauthorized("Invalid admin password.");
  }

  const search = request.nextUrl.searchParams.get("search") || undefined;
  const invitations = await listActiveInvitations(search);
  return NextResponse.json({ invitations });
}

export async function POST(request: NextRequest) {
  const adminPassword = getAdminPassword();
  if (!adminPassword) {
    return NextResponse.json({ message: "Admin password not configured." }, { status: 500 });
  }

  if (getPasswordFromRequest(request) !== adminPassword) {
    return unauthorized("Invalid admin password.");
  }

  const body = (await request.json()) as { action?: string; slug?: string };
  if (!body.action || !body.slug) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    if (body.action === "delete") {
      await deleteInvitation(body.slug);
    } else if (body.action === "extend") {
      await extendInvitationExpiry(body.slug);
    } else {
      return NextResponse.json({ message: "Unknown action." }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Unable to complete admin action." }, { status: 500 });
  }
}
