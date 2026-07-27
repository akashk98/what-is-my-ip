import type { ReactNode } from "react";

interface CardShellProps {
  title?: string;
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export default function CardShell({ title, header, footer, children, className = "" }: CardShellProps) {
  return (
    <div className={`rounded-[28px] border border-[var(--inv-border)] bg-[var(--inv-surface)] p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.2)] transition duration-300 ${className}`}>
      {(title || header) ? (
        <div className="mb-5 flex items-start justify-between gap-4">
          {title ? <div className="text-sm font-semibold uppercase tracking-[0.26em] text-[var(--inv-accent)]">{title}</div> : null}
          {header}
        </div>
      ) : null}
      {children}
      {footer ? <div className="mt-6">{footer}</div> : null}
    </div>
  );
}
