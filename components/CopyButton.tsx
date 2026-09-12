"use client";

import { useState } from "react";

interface Props {
  /** What to put on the clipboard. */
  text: string;
  label: string;
  /** Shown for two seconds after a successful copy. */
  doneLabel?: string;
  emptyMessage?: string;
  className?: string;
}

export default function CopyButton({
  text,
  label,
  doneLabel = "Copied",
  emptyMessage = "There is nothing to copy.",
  className,
}: Props) {
  const [message, setMessage] = useState("");

  async function handleClick() {
    if (!text) {
      setMessage(emptyMessage);
      return;
    }
    try {
      await copyText(text);
      setMessage(doneLabel);
    } catch {
      setMessage("Could not copy. Please press and hold to copy by hand.");
    }
    window.setTimeout(() => setMessage(""), 2500);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base font-medium"
      >
        {label}
      </button>
      {message && <p className="mt-2 text-sm text-stone-600">{message}</p>}
    </div>
  );
}

/** Older phone browsers have no clipboard button, so fall back to the old way. */
async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const box = document.createElement("textarea");
  box.value = text;
  box.setAttribute("readonly", "");
  box.style.position = "absolute";
  box.style.left = "-9999px";
  document.body.appendChild(box);
  box.select();
  const worked = document.execCommand("copy");
  document.body.removeChild(box);
  if (!worked) throw new Error("copy failed");
}
