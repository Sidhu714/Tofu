"use client";

import { useEffect, useRef, useState } from "react";
import { LANGUAGE_CHOICES } from "@/lib/languages";

const languages = Object.entries(LANGUAGE_CHOICES);
const ACTIVE_COLOR = "#34D8A6";

export default function LanguageSelector({
  language,
  onSelect,
}: {
  language: string;
  onSelect: (language: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-[30px] items-center gap-2 rounded-full border border-[#2A2A31] bg-[#1C1C21] px-3 text-[#F4F4F6] transition hover:border-[#34D8A6] hover:bg-[#232328] active:bg-[#232328]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="font-mono text-xs">{language}</span>
        <svg
          className={`h-4 w-4 text-[#9A9AA5] transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 min-w-[180px] overflow-hidden rounded-lg border border-[#232328] bg-[#131316] py-1 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
          {languages.map(([lang, version]) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                onSelect(lang);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between bg-transparent px-3 py-2 text-left text-sm hover:bg-[#1C1C21]"
              style={{
                color: lang === language ? ACTIVE_COLOR : "#D4D4D8",
              }}
            >
              <span className="flex-1">{lang}</span>
              <span className="font-mono text-xs text-[#616169]">
                {version}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}