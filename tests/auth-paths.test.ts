import { describe, expect, it } from "vitest";
import {
  isPlatformAdmin,
  isProtectedPath,
  safeNextPath,
} from "@/lib/auth-paths";

describe("isProtectedPath", () => {
  it("protects the admin and owner areas", () => {
    for (const p of [
      "/admin",
      "/admin/businesses/new",
      "/dashboard",
      "/inbox/abc",
      "/leads",
    ]) {
      expect(isProtectedPath(p), p).toBe(true);
    }
  });

  it("leaves public pages alone", () => {
    for (const p of [
      "/",
      "/login",
      "/forwarding",
      "/auth/confirm",
      "/administrator",
      "/api/twilio/sms",
    ]) {
      expect(isProtectedPath(p), p).toBe(false);
    }
  });
});

describe("safeNextPath", () => {
  it("allows paths on this site", () => {
    expect(safeNextPath("/inbox/123?tab=all")).toBe("/inbox/123?tab=all");
  });

  it("blocks redirects to other sites", () => {
    for (const bad of [
      "//evil.com",
      "/\\evil.com",
      "https://evil.com",
      "evil.com",
      "",
      null,
      undefined,
    ]) {
      expect(safeNextPath(bad, "/dashboard"), String(bad)).toBe("/dashboard");
    }
  });
});

describe("isPlatformAdmin", () => {
  const list = " Owner@Example.com , second@example.com,";

  it("matches listed emails, ignoring case and spaces", () => {
    expect(isPlatformAdmin("owner@example.com", list)).toBe(true);
    expect(isPlatformAdmin("SECOND@example.com ", list)).toBe(true);
  });

  it("rejects everyone else", () => {
    expect(isPlatformAdmin("someone@example.com", list)).toBe(false);
    expect(isPlatformAdmin("", list)).toBe(false);
    expect(isPlatformAdmin(null, list)).toBe(false);
    expect(isPlatformAdmin("owner@example.com", "")).toBe(false);
    expect(isPlatformAdmin("owner@example.com", undefined)).toBe(false);
  });

  it("does not match partial emails", () => {
    expect(isPlatformAdmin("wner@example.com", list)).toBe(false);
    expect(isPlatformAdmin("owner@example.co", list)).toBe(false);
  });
});
