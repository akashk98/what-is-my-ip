export function buildCalendarEvent({ title, date, time, venue, description, url }: {
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  url: string;
}) {
  const start = `${date.replace(/-/g, "") }T${time.replace(/:/g, "")}00`;
  const end = `${date.replace(/-/g, "") }T${time.replace(/:/g, "")}00`;
  const ics = [`BEGIN:VCALENDAR`, `VERSION:2.0`, `PRODID:-//AK World//EN`, `CALSCALE:GREGORIAN`, `METHOD:PUBLISH`, `BEGIN:VEVENT`, `UID:${crypto.randomUUID()}`, `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15)}Z`, `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${title}`, `DESCRIPTION:${description}\n${url}`, `LOCATION:${venue}`, `END:VEVENT`, `END:VCALENDAR`].join("\r\n");
  return ics;
}

export function downloadCalendar(ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Invitation.ics";
  link.click();
  URL.revokeObjectURL(link.href);
}
