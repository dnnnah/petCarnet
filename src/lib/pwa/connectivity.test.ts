import { describe, expect, it } from "vitest";
import {
  getBrowserOnline,
  resolveConnectivityStatus,
} from "@/lib/pwa/connectivity";

describe("resolveConnectivityStatus", () => {
  it("mapea true a online", () => {
    expect(resolveConnectivityStatus(true)).toBe("online");
  });

  it("mapea false a offline", () => {
    expect(resolveConnectivityStatus(false)).toBe("offline");
  });

  it("mapea null/undefined (SSR o API ausente) a unknown", () => {
    expect(resolveConnectivityStatus(null)).toBe("unknown");
    expect(resolveConnectivityStatus(undefined)).toBe("unknown");
  });
});

describe("getBrowserOnline", () => {
  it("devuelve null durante SSR (sin navigator)", () => {
    expect(getBrowserOnline()).toBeNull();
  });
});