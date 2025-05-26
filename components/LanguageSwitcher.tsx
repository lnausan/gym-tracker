"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ChangeEvent } from "react";

const locales = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.replace(segments.join("/"));
  };

  console.log("LanguageSwitcher mounted");
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 999999,
        background: "red",
        color: "white",
        padding: 20,
        fontSize: 32,
      }}
    >
      LANGUAGE SWITCHER
      <select
        value={locale}
        onChange={handleChange}
        style={{
          background: "blue",
          color: "white",
          fontWeight: "bold",
          borderRadius: 20,
          padding: 16,
          fontSize: 24,
          border: "4px solid yellow",
          marginLeft: 20,
        }}
      >
        {locales.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
} 