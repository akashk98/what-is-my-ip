interface InfoCardProps {
  title: string;
  items: Array<{ label: string; value: string; icon: string }>;
  actionLabel?: string;
  actionHref?: string;
}

import CardShell from "./CardShell";

export default function InfoCard({ title, items, actionLabel, actionHref }: InfoCardProps) {
  return (
    <CardShell title={title}>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-4 rounded-[24px] bg-slate-50 p-4">
            <div className="inline-flex h-12 w-12 min-w-[3rem] items-center justify-center rounded-[18px] bg-[var(--inv-overlay)] text-[var(--inv-primary)] text-lg">{item.icon}</div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.26em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--inv-text)]">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      {actionLabel && actionHref ? (
        <a
          href={actionHref}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center rounded-[20px] bg-[var(--inv-button)] px-4 py-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--inv-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--inv-accent)] focus:ring-offset-2"
        >
          {actionLabel}
        </a>
      ) : null}
    </CardShell>
  );
}
