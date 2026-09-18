import * as core from "@actions/core";
import { DEFAULT_API, draftPayload, nestMessage, summaryBullet } from "./format.js";

type ReleaseResponse = {
  id?: string;
  version?: string;
  channel?: string;
  status?: string;
  createdAt?: string;
  slug?: string;
  changelogUrl?: string;
  editorUrl?: string;
};

async function postDraft(
  apiUrl: string,
  token: string,
  payload: Record<string, string>,
  idempotencyKey: string,
): Promise<{ status: number; body: unknown }> {
  const origin = apiUrl.trim().replace(/\/+$/, "") || DEFAULT_API;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  const res = await fetch(`${origin}/api/v1/releases`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30_000),
  });
  const raw = await res.text();
  let parsed: unknown = raw;
  if (raw) {
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      parsed = raw.trim();
    }
  }
  return { status: res.status, body: parsed };
}

export async function run(): Promise<void> {
  const token = core.getInput("token", { required: true }).trim();
  if (!token) {
    const message = "token is required";
    core.error(message, { title: "Release Compass" });
    core.setFailed(message);
    return;
  }
  core.setSecret(token);

  const payload = draftPayload({
    version: core.getInput("version", { required: true }),
    title: core.getInput("title"),
    body: core.getInput("body"),
    url: core.getInput("url"),
    channel: core.getInput("channel"),
  });

  const { status, body } = await postDraft(
    core.getInput("api-url") || DEFAULT_API,
    token,
    payload,
    core.getInput("idempotency-key").trim(),
  );

  if (
    status < 200 ||
    status >= 300 ||
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    const detail = nestMessage(body, `HTTP ${status}`);
    const message = `Could not open draft (${status}): ${detail}`;
    core.error(message, { title: "Release Compass" });
    core.setFailed(message);
    return;
  }

  const release = body as ReleaseResponse;
  const version = String(release.version || payload.version);
  const channel = String(release.channel || "stable");
  const releaseStatus = String(release.status || "DRAFT");
  const created = String(release.createdAt || "");
  const id = String(release.id || "");
  const slug = String(release.slug || "");
  const publicUrl = String(release.changelogUrl || "");
  const editorUrl = String(release.editorUrl || "");
  const readableStatus = releaseStatus.toLowerCase();

  core.setOutput("id", id);
  core.setOutput("version", version);
  core.setOutput("channel", channel);
  core.setOutput("status", releaseStatus);
  core.setOutput("created-at", created);
  core.setOutput("slug", slug);
  core.setOutput("changelog-url", publicUrl);
  core.setOutput("editor-url", editorUrl);

  let notice = `${version} · ${readableStatus} · ${channel}`;
  if (editorUrl) {
    notice = `${notice} · ${editorUrl}`;
  }
  core.notice(notice, { title: "Release Compass draft" });

  core.info("Opened a Release Compass draft");
  core.info(`  Version:    ${version}`);
  if (slug) {
    core.info(`  Slug:       ${slug}`);
  }
  core.info(`  Channel:    ${channel}`);
  core.info(`  Status:     ${readableStatus}`);
  if (created) {
    core.info(`  Created:    ${created}`);
  }
  if (editorUrl) {
    core.info(`  Editor:     ${editorUrl}`);
  }
  if (publicUrl) {
    core.info(`  Changelog:  ${publicUrl}`);
  }
  core.info("  Publishing stays in the dashboard.");

  await core.summary
    .addRaw("## Release Compass draft")
    .addEOL()
    .addRaw(
      [
        summaryBullet("Version", version),
        summaryBullet("Channel", channel),
        summaryBullet("Status", readableStatus),
        summaryBullet("Created", created),
        summaryBullet("Editor", editorUrl, editorUrl),
        summaryBullet("Changelog", publicUrl, publicUrl),
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .addEOL()
    .addRaw("Publishing stays in the dashboard.")
    .write();
}

void run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  core.error(message, { title: "Release Compass" });
  core.setFailed(message);
});
