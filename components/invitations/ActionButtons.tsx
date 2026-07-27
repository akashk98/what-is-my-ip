"use client";

import { useEffect, useMemo, useState } from "react";
import useCopyToClipboard from "./useCopyToClipboard";
import useDownloadInvitation from "./useDownloadInvitation";
import { buildCalendarEvent, downloadCalendar } from "./downloadCalendar";

interface ActionButtonsProps {
  whatsappUrl: string;
  calendarEvent: {
    title: string;
    date: string;
    time: string;
    venue: string;
    description: string;
    url: string;
  };
  inviteElementId: string;
  shareUrl: string;
}

function ActionButton({ onClick, label, icon, href, disabled, loading }: { onClick?: () => void; href?: string; label: string; icon: string; disabled?: boolean; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-w-[140px] flex-1 items-center justify-center gap-3 rounded-[22px] border border-transparent bg-[var(--inv-button)] px-4 py-4 text-sm font-semibold text-white shadow-[0_15px_40px_-20px_rgba(15,23,42,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--inv-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--inv-accent)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span>{icon}</span>
      <span>{loading ? "Loading..." : label}</span>
    </button>
  );
}

export default function ActionButtons({ whatsappUrl, calendarEvent, inviteElementId, shareUrl }: ActionButtonsProps) {
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);
  const { copied, copy } = useCopyToClipboard();
  const { loading: imageLoading, downloadInvitation } = useDownloadInvitation();

  useEffect(() => {
    setShareSupported(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const onDownload = async () => {
    setDownloadLoading(true);
    try {
      await downloadInvitation(inviteElementId);
    } finally {
      setDownloadLoading(false);
    }
  };

  const onShare = async () => {
    setShareLoading(true);
    try {
      if (shareSupported) {
        await navigator.share({ title: calendarEvent.title, text: calendarEvent.description, url: shareUrl });
      } else {
        await copy(shareUrl);
      }
    } finally {
      setShareLoading(false);
    }
  };

  const onCalendar = async () => {
    setCalendarLoading(true);
    try {
      const ics = buildCalendarEvent(calendarEvent);
      downloadCalendar(ics);
    } finally {
      setCalendarLoading(false);
    }
  };

  const whatsappAction = useMemo(
    () => ({ href: whatsappUrl, label: "WhatsApp", icon: "💬" }),
    [whatsappUrl],
  );

  return (
    <div className="rounded-[28px] border border-[var(--inv-border)] bg-[var(--inv-surface)] p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.2)]">
      <div className="grid gap-3 sm:grid-cols-2">
        <ActionButton onClick={onDownload} label="Download" icon="⬇️" loading={downloadLoading || imageLoading} />
        <ActionButton onClick={onShare} label={shareSupported ? "Share" : copied ? "Copied" : "Copy link"} icon="🔗" loading={shareLoading} />
        <a
          href={whatsappAction.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-w-[140px] flex-1 items-center justify-center gap-3 rounded-[22px] border border-transparent bg-[var(--inv-button)] px-4 py-4 text-sm font-semibold text-white shadow-[0_15px_40px_-20px_rgba(15,23,42,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--inv-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--inv-accent)] focus:ring-offset-2"
        >
          <span>{whatsappAction.icon}</span>
          <span>{whatsappAction.label}</span>
        </a>
        <ActionButton onClick={onCalendar} label="Add to Calendar" icon="📅" loading={calendarLoading} />
      </div>
      <div className="mt-4 min-h-[1.5rem] text-sm text-emerald-600" aria-live="polite">
        {copied && !shareSupported ? "Copied invitation URL to clipboard." : ""}
      </div>
    </div>
  );
}
