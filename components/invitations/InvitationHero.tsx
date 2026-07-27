interface InvitationHeroProps {
  title: string;
  photoUrl: string;
  eventType: string;
}

export default function InvitationHero({ title, photoUrl, eventType }: InvitationHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[var(--inv-border)] bg-[var(--inv-surface)] shadow-[0_24px_80px_-50px_rgba(15,23,42,0.35)]">
      <div className="overflow-hidden rounded-[28px] bg-white">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={photoUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-700 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
            <div className="inline-flex rounded-full bg-[var(--inv-ribbon)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-lg shadow-[rgba(15,23,42,0.18)]">Happy {eventType}!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
