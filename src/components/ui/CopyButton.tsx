"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyTextToClipboard } from "@/lib/clipboard";

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
      className={[
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold transition outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        copied
          ? "bg-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.28)]"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 hover:ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-800 dark:hover:bg-emerald-500/25",
      ].join(" ")}
    >
      {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}