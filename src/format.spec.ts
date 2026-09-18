import { describe, expect, it } from "vitest";
import { draftPayload, nestMessage, summaryBullet } from "./format.js";

describe("submit-release helpers", () => {
  it("reads Nest error messages", () => {
    expect(nestMessage({ message: "nope" }, "fallback")).toBe("nope");
    expect(nestMessage({ message: ["first"] }, "fallback")).toBe("first");
  });

  it("builds a create payload", () => {
    expect(
      draftPayload({
        version: " v0.3.0 ",
        title: "",
        body: "notes",
        url: "https://github.com/example/repo/releases/tag/v0.3.0",
        channel: "",
      }),
    ).toEqual({
      version: "v0.3.0",
      title: "v0.3.0",
      body: "notes",
      url: "https://github.com/example/repo/releases/tag/v0.3.0",
    });
  });

  it("requires a version", () => {
    expect(() =>
      draftPayload({ version: " ", title: "", body: "", url: "", channel: "" }),
    ).toThrow("version is required");
  });

  it("formats summary bullets as markdown", () => {
    expect(summaryBullet("Version", "v0.4.0")).toBe("- **Version:** v0.4.0");
    expect(
      summaryBullet(
        "Editor",
        "https://release-compass.app/dashboard/?projectId=p&releaseId=r",
        "https://release-compass.app/dashboard/?projectId=p&releaseId=r",
      ),
    ).toBe(
      "- **Editor:** [https://release-compass.app/dashboard/?projectId=p&releaseId=r](https://release-compass.app/dashboard/?projectId=p&releaseId=r)",
    );
    expect(summaryBullet("Changelog", "")).toBe("");
  });
});
