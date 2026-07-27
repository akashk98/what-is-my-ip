interface SummaryCardProps {
  summary: Array<{ label: string; value: string; icon: string }>;
}

import CardShell from "./CardShell";

export default function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <CardShell title="Event summary">
      <div className="space-y-4">
        {summary.map((item) => (
          <div key={item.label} className="flex items-center gap-4 rounded-[24px] bg-slate-50 p-4">
            <div className="inline-flex h-12 w-12 min-w-[3rem] items-center justify-center rounded-[18px] bg-[var(--inv-overlay)] text-[var(--inv-primary)] text-lg">{item.icon}</div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.26em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--inv-text)]">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
