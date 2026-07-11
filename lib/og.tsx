import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* Shared machinery for the generated OG images (app/opengraph-image.tsx,
   app/docs/[slug]/opengraph-image.tsx) and app/apple-icon.tsx. Satori can't
   reach next/font's build cache, so the JetBrains Mono woffs come from the
   @fontsource/jetbrains-mono devDependency. Brand tokens mirror
   app/globals.css @theme — keep in sync. */

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  ground: "#0b1120",
  accent: "#61dafb",
  slate: "#475569",
  gray: "#94a3b8",
  fg: "#e2e8f0",
} as const;

const FONT_DIR = join(
  process.cwd(),
  "node_modules/@fontsource/jetbrains-mono/files",
);

export async function loadOgFonts() {
  const [regular, bold] = await Promise.all([
    readFile(join(FONT_DIR, "jetbrains-mono-latin-400-normal.woff")),
    readFile(join(FONT_DIR, "jetbrains-mono-latin-700-normal.woff")),
  ]);
  return [
    {
      name: "JetBrains Mono",
      data: regular,
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: "JetBrains Mono",
      data: bold,
      style: "normal" as const,
      weight: 700 as const,
    },
  ];
}

/* use(hookli) lockup — parens slate, name cyan, same as components/Wordmark. */
export function OgWordmark({ fontSize }: { fontSize: number }) {
  return (
    <div style={{ display: "flex", fontSize, fontWeight: 700 }}>
      <span style={{ color: OG_COLORS.slate }}>use(</span>
      <span style={{ color: OG_COLORS.accent }}>hookli</span>
      <span style={{ color: OG_COLORS.slate }}>)</span>
    </div>
  );
}
