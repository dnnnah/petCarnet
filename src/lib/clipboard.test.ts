import { afterEach, describe, expect, it, vi } from "vitest";
import { copyTextToClipboard } from "./clipboard";

type FakeNavigator = {
  clipboard?: { writeText: (text: string) => Promise<void> };
};

type FakeDocument = {
  createElement: (tag: string) => {
    value: string;
    style: Record<string, string>;
    setAttribute: (key: string, value: string) => void;
    select: () => void;
    remove: () => void;
  };
  body: { appendChild: (node: unknown) => void; removeChild: (node: unknown) => void };
  execCommand: (command: string) => boolean;
};

function makeFakeDocument(execCopy = true): FakeDocument {
  return {
    createElement: () => ({
      value: "",
      style: {},
      setAttribute: () => undefined,
      select: () => undefined,
      remove: () => undefined,
    }),
    body: {
      appendChild: () => undefined,
      removeChild: () => undefined,
    },
    execCommand: (command) => (command === "copy" ? execCopy : false),
  };
}

function stubGlobals(navigator: FakeNavigator | undefined, document: FakeDocument | undefined) {
  const stubbedNavigator = navigator as Navigator;
  if (stubbedNavigator === undefined) {
    vi.stubGlobal("navigator", undefined);
  } else {
    vi.stubGlobal("navigator", { ...stubbedNavigator });
  }

  if (document === undefined) {
    vi.stubGlobal("document", undefined);
  } else {
    vi.stubGlobal("document", { ...document });
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("copyTextToClipboard", () => {
  it("usa el Clipboard API cuando está disponible", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubGlobals({ clipboard: { writeText } }, undefined);

    await expect(copyTextToClipboard("PC-LOKI-001")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("PC-LOKI-001");
  });

  it("hace fallback al método legacy cuando el Clipboard API falla", async () => {
    const failing: FakeNavigator = { clipboard: { writeText: vi.fn().mockRejectedValueOnce(new Error("denied")) } };
    stubGlobals(failing, makeFakeDocument(true));

    await expect(copyTextToClipboard("PC-LOKI-001")).resolves.toBe(true);
  });

  it("usa el método legacy cuando no hay Clipboard API", async () => {
    const doc = makeFakeDocument(true);
    const execCommandSpy = vi.spyOn(doc, "execCommand");
    stubGlobals({}, doc);

    await expect(copyTextToClipboard("PC-LOKI-001")).resolves.toBe(true);
    expect(execCommandSpy).toHaveBeenCalledWith("copy");
  });

  it("devuelve false cuando todos los caminos fallan", async () => {
    const failing: FakeNavigator = { clipboard: { writeText: vi.fn().mockRejectedValueOnce(new Error("denied")) } };
    stubGlobals(failing, makeFakeDocument(false));

    await expect(copyTextToClipboard("PC-LOKI-001")).resolves.toBe(false);
  });

  it("devuelve false sin document ni Clipboard API (entorno sin DOM)", async () => {
    stubGlobals(undefined, undefined);

    await expect(copyTextToClipboard("PC-LOKI-001")).resolves.toBe(false);
  });
});