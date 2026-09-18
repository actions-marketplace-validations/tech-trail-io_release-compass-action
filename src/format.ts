export const DEFAULT_API = "https://api.release-compass.app";

export function summaryBullet(label: string, value: string, href = ""): string {
  const text = value.trim();
  if (!text) {
    return "";
  }
  const link = href.trim();
  const display = link ? `[${text}](${link})` : text;
  return `- **${label}:** ${display}`;
}

export function nestMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }
  if (!payload || typeof payload !== "object") {
    return fallback;
  }
  const raw = (payload as { message?: unknown }).message;
  if (Array.isArray(raw)) {
    const first = raw.find((item) => typeof item === "string" && item.trim());
    return typeof first === "string" ? first.trim() : fallback;
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim();
  }
  return fallback;
}

export function draftPayload(input: {
  version: string;
  title: string;
  body: string;
  url: string;
  channel: string;
}): Record<string, string> {
  const version = input.version.trim();
  if (!version) {
    throw new Error("version is required");
  }
  const payload: Record<string, string> = {
    version,
    title: input.title.trim() || version,
    body: input.body,
  };
  const url = input.url.trim();
  if (url) {
    payload.url = url;
  }
  const channel = input.channel.trim();
  if (channel) {
    payload.channel = channel;
  }
  return payload;
}
