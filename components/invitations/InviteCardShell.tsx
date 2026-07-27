import type { ReactNode } from "react";

interface InviteCardShellProps {
  children: ReactNode;
  className?: string;
}

export default function InviteCardShell({ children, className = "" }: InviteCardShellProps) {
  return (
    <div
      id="invitation-card"
      className={`rounded-[32px] border border-[var(--inv-border)] bg-white/90 p-0 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.25)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
