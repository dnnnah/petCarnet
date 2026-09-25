"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyTextToClipboard } from "@/lib/clipboard";
import { cx } from "@/lib/ui/tone";

type CopyButtonProps = {
  value: string;
  label: string;
  copiedLabel?: string;
};

export function CopyButton({ value, label, copiedLabel = "¡Copiado!" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const ok = await copyTextToClipboard(value);
    if (!ok) {
      setCopied(false);
      return;
    }

    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      className={cx(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors duration-150",
        copied
          ? "bg-success-soft text-success ring-1 ring-inset ring-success-rule"
          : "bg-surface text-ink-2 ring-1 ring-inset ring-rule hover:bg-sunken hover:text-ink"
      )}
    >
      {copied ? (
        <Check size={15} aria-hidden="true" />
      ) : (
        <Copy size={15} aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
