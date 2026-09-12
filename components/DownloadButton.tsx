"use client";

import { useState } from "react";

interface Props {
  href: string;
  label: string;
  className: string;
}

/**
 * A download can take a few seconds. Without this the organiser taps again
 * and again, thinking nothing happened.
 */
export default function DownloadButton({ href, label, className }: Props) {
  const [busy, setBusy] = useState(false);

  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        setBusy(true);
        window.setTimeout(() => setBusy(false), 6000);
      }}
    >
      {busy ? "Please wait…" : label}
    </a>
  );
}
