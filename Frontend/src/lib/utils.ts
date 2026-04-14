export function formatMessageTime(date: string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatRelativeTime(date: string): string {
  const now = Date.now();
  const target = new Date(date).getTime();
  const diffMs = target - now;
  const diffSec = Math.round(diffMs / 1000);

  if (Math.abs(diffSec) < 5) return "just now";

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const absSec = Math.abs(diffSec);

  if (absSec < 60) return rtf.format(diffSec, "second");

  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");

  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");

  const diffDay = Math.round(diffHour / 24);
  return rtf.format(diffDay, "day");
}