"use client";

import { BIBLE_VERSIONS } from "../data/books";
import type { BibleVersion } from "../types";

interface VersionSelectorProps {
  value: BibleVersion;
  onChange: (v: BibleVersion) => void;
}

export function VersionSelector({ value, onChange }: VersionSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as BibleVersion)}
      className="text-sm rounded-md px-3 py-1.5"
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        color: "var(--text)",
      }}
    >
      {BIBLE_VERSIONS.map((v) => (
        <option key={v.code} value={v.code}>
          {v.code} — {v.label}
        </option>
      ))}
    </select>
  );
}
