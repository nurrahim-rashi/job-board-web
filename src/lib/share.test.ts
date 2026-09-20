import { describe, expect, it } from "vitest";

import {
  buildShareTargets,
  defaultShareMessage,
  shareText,
  type SharePlatform,
} from "./share";

const JOB_URL = "https://www.polarisjobs.my.id/jobs/senior-platform-engineer";

const targets = (message: string) => {
  const map = new Map<SharePlatform, string>();
  for (const target of buildShareTargets({ url: JOB_URL, message }))
    map.set(target.name, target.href);
  return map;
};

describe("share message", () => {
  it("seeds the message with the role and the company", () => {
    expect(defaultShareMessage("Product Lead", "PT Teknologi Nusantara")).toBe(
      "Check out Product Lead at PT Teknologi Nusantara on Polaris.",
    );
  });

  it("joins the message and the link, trimming stray whitespace", () => {
    expect(shareText("  Great role  ", JOB_URL)).toBe(`Great role ${JOB_URL}`);
  });

  it("falls back to the bare link when the message is emptied", () => {
    expect(shareText("   ", JOB_URL)).toBe(JOB_URL);
  });
});

describe("share targets", () => {
  it("offers exactly the four required platforms", () => {
    expect(
      buildShareTargets({ url: JOB_URL, message: "hi" }).map(
        (target) => target.name,
      ),
    ).toEqual(["LinkedIn", "Facebook", "X (Twitter)", "WhatsApp"]);
  });

  it("points each platform at its own share endpoint", () => {
    const hrefs = targets("A role worth a look");

    expect(hrefs.get("LinkedIn")).toContain(
      "linkedin.com/sharing/share-offsite/",
    );
    expect(hrefs.get("Facebook")).toContain("facebook.com/sharer/sharer.php");
    expect(hrefs.get("X (Twitter)")).toContain("x.com/intent/tweet");
    expect(hrefs.get("WhatsApp")).toContain("wa.me/");
  });

  it("carries the custom message to the platforms that accept text", () => {
    const message = "This team ships & pays fairly";
    const hrefs = targets(message);

    const twitter = new URL(hrefs.get("X (Twitter)")!);
    expect(twitter.searchParams.get("text")).toBe(message);
    expect(twitter.searchParams.get("url")).toBe(JOB_URL);

    const whatsapp = new URL(hrefs.get("WhatsApp")!);
    expect(whatsapp.searchParams.get("text")).toBe(
      `${message} ${JOB_URL}`,
    );
  });

  it("flags the platforms that can only take the link", () => {
    const byName = Object.fromEntries(
      buildShareTargets({ url: JOB_URL, message: "hi" }).map((target) => [
        target.name,
        target,
      ]),
    );

    expect(byName["LinkedIn"].carriesMessage).toBe(false);
    expect(byName["Facebook"].carriesMessage).toBe(false);
    expect(byName["X (Twitter)"].carriesMessage).toBe(true);
    expect(byName["WhatsApp"].carriesMessage).toBe(true);

    // Their hints have to tell the user the message went to the clipboard.
    expect(byName["LinkedIn"].hint).toMatch(/copied/i);
    expect(byName["Facebook"].hint).toMatch(/copied/i);
  });

  it("escapes characters that would otherwise break the share URL", () => {
    const hrefs = targets("50% remote & flexible hours #hiring");

    const twitter = new URL(hrefs.get("X (Twitter)")!);
    expect(twitter.searchParams.get("text")).toBe(
      "50% remote & flexible hours #hiring",
    );
    // The raw href must not contain an unencoded separator that would truncate
    // the message or invent a new query parameter.
    expect(hrefs.get("X (Twitter)")).toContain("%26");
    expect(hrefs.get("X (Twitter)")).toContain("%23");
  });

  it("encodes the job URL itself so query strings survive", () => {
    const trackedUrl = `${JOB_URL}?ref=share&utm_source=polaris`;
    const [linkedin] = buildShareTargets({
      url: trackedUrl,
      message: "hi",
    });

    expect(new URL(linkedin.href).searchParams.get("url")).toBe(trackedUrl);
  });
});
