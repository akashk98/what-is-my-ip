import type { EventType, InvitationTheme } from "@/services/invitations";
import { eventHeading, themeOptions } from "./template-data";
import { getThemePalette } from "./theme";

interface InvitationHeaderProps {
  eventType: EventType;
  theme: InvitationTheme;
}

export default function InvitationHeader({ eventType, theme }: InvitationHeaderProps) {
  const palette = getThemePalette(theme);
  const selected = themeOptions.find((option) => option.value === theme)?.label ?? palette.label;

  return (
    <div className="rounded-[28px] border border-[var(--inv-border)] bg-[var(--inv-surface)] p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.2)] transition duration-300 hover:-translate-y-1">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.36em] text-[var(--inv-accent)]">{eventHeading[eventType]}</div>
          <h1 className="text-3xl font-semibold leading-tight text-[var(--inv-text)]">Premium invitation design</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--inv-overlay)] px-4 py-3 text-sm font-semibold text-[var(--inv-primary)] shadow-sm">
          <span>Theme:</span>
          <span>{selected}</span>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-6 text-slate-600">A premium invitation layout crafted for modern celebrations, elegant typography, and thoughtful spacing.</p>
    </div>
  );
}
