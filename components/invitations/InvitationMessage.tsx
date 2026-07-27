interface InvitationMessageProps {
  title: string;
  message: string;
  host: string;
  date: string;
  time: string;
}

function InfoBadge({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-center gap-3 text-slate-700">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--inv-primary)] shadow-sm">{icon}</span>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function InvitationMessage({ title, message, host, date, time }: InvitationMessageProps) {
  return (
    <div className="rounded-[28px] border border-[var(--inv-border)] bg-[var(--inv-surface)] p-8 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.2)]">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.32em] text-[var(--inv-accent)]">You're invited</p>
        <h2 className="mt-4 text-4xl font-semibold leading-tight text-[var(--inv-text)]">{title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">{message}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <InfoBadge label="Host" value={host} icon="👤" />
        <InfoBadge label="Date & Time" value={`${date} · ${time}`} icon="📅" />
      </div>
    </div>
  );
}
