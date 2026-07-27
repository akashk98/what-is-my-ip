"use client";

import { useEffect, useMemo, useState } from "react";
import type { EventType, InvitationTheme } from "@/services/invitations";
import { getThemeStyles } from "./template-data";
import { DEFAULT_PHOTO_PLACEHOLDER, DEFAULT_QR_PLACEHOLDER } from "./defaultInvitationData";

interface InvitationTemplateProps {
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
  inviteUrl?: string;
  publicMode?: boolean;
}

import { eventHeading } from "./template-data";

export default function InvitationTemplate({
  eventType,
  name,
  title,
  message,
  date,
  time,
  venue,
  mapsUrl,
  contactNumber,
  photoDataUrl,
  qrCodeDataUrl,
  theme,
  inviteUrl,
  publicMode = false,
}: InvitationTemplateProps) {
  const [currentOrigin, setCurrentOrigin] = useState<string>("");
  const styles = getThemeStyles(theme);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const shareUrl = useMemo(() => {
    const base = inviteUrl || (currentOrigin ? `${currentOrigin}${window.location.pathname}` : "");
    return base ? `https://wa.me/?text=${encodeURIComponent(`You're invited to ${title} by ${name} on ${date} at ${time}. View invitation: ${base}`)}` : "";
  }, [currentOrigin, inviteUrl, title, name, date, time]);

  return (
    <section className={`${styles.container} rounded-3xl p-5 shadow-sm shadow-slate-200 sm:p-6`}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm shadow-slate-100 sm:px-5">
            <span className={`font-semibold uppercase tracking-[0.22em] ${styles.accent}`}>{eventHeading[eventType]}</span>
            <span className="text-slate-500">{theme}</span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
            <img
              className="h-auto w-full object-cover"
              src={photoDataUrl || DEFAULT_PHOTO_PLACEHOLDER}
              alt={photoDataUrl ? "Invitation photo" : "Photo placeholder"}
            />
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-lg font-semibold text-slate-900">{title || "Event Title"}</div>
            <div className="text-sm text-slate-600">{message || "A personal message appears here after you fill out the form."}</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-100">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Host</div>
                <div className="mt-2 text-base font-semibold text-slate-900">{name || "Host Name"}</div>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-100">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">When</div>
                <div className="mt-2 text-base font-semibold text-slate-900">{date || "Date"}</div>
                <div className="text-sm text-slate-600">{time || "Time"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl bg-white/90 p-5 shadow-sm shadow-slate-100 sm:p-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Details</div>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div>
                <div className="font-semibold text-slate-900">Venue</div>
                <div>{venue || "Venue details go here."}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-900">Contact</div>
                <div>{contactNumber || "Contact number"}</div>
              </div>
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex w-full items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition ${styles.button}`}
                >
                  Open Maps
                </a>
              ) : (
                <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500">Add a Google Maps URL to enable directions</div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">QR Code</div>
            <img
              className="mt-4 w-full rounded-3xl border border-slate-200 object-contain"
              src={qrCodeDataUrl || DEFAULT_QR_PLACEHOLDER}
              alt={qrCodeDataUrl ? "QR code" : "QR code placeholder"}
            />
          </div>

          {publicMode ? (
            <div className="space-y-3">
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Share by WhatsApp
              </a>
              <div className="rounded-3xl border border-slate-200 bg-slate-100 p-4 text-center text-sm text-slate-600">
                Created with AK World
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
