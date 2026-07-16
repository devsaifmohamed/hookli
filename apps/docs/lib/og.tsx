import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* Shared machinery for the generated OG images (app/opengraph-image.tsx,
   app/docs/[slug]/opengraph-image.tsx) and app/apple-icon.tsx. Satori can't
   reach next/font's build cache (and doesn't read woff2), so the woffs come
   from the @fontsource devDependencies. NOTE — intentional divergence: OG images
   and the brand assets keep the gray-90 (#23272f) ground so they work standalone,
   while the SITE's page ground is one step darker (gray-95 #16181d) per the
   surface re-tier. Do not "sync" OG_COLORS.ground to the site ground. */

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  ground: "#23272f",
  accent: "#61dafb",
  gray: "#bcc1cd",
  fg: "#f6f7f9",
} as const;

const FONT_FILES = join(process.cwd(), "node_modules/@fontsource");

export async function loadOgFonts() {
  const [sansRegular, sansBold, monoRegular, monoBold] = await Promise.all([
    readFile(
      join(
        FONT_FILES,
        "plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff",
      ),
    ),
    readFile(
      join(
        FONT_FILES,
        "plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff",
      ),
    ),
    readFile(
      join(FONT_FILES, "jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff"),
    ),
    readFile(
      join(FONT_FILES, "jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff"),
    ),
  ]);
  return [
    {
      name: "Plus Jakarta Sans",
      data: sansRegular,
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: "Plus Jakarta Sans",
      data: sansBold,
      style: "normal" as const,
      weight: 700 as const,
    },
    {
      name: "JetBrains Mono",
      data: monoRegular,
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: "JetBrains Mono",
      data: monoBold,
      style: "normal" as const,
      weight: 700 as const,
    },
  ];
}

/* The brand mark from public/hookli-icon.svg without the tile — a hook cradling
   a state dot. Satori needs explicit svg dimensions; viewBox is 110×140. */
export function OgMark({ height }: { height: number }) {
  const width = Math.round((height * 110) / 140);
  return (
    <svg width={width} height={height} viewBox="-13 -3 110 140" fill="none">
      <path
        d="M84 10 V82 A42 42 0 1 1 0 82 V58"
        stroke={OG_COLORS.accent}
        strokeWidth={26}
        strokeLinecap="round"
      />
      <circle cx={42} cy={82} r={15} fill={OG_COLORS.fg} />
    </svg>
  );
}

/* hookli. lockup — brand v4 (React palette), same as components/wordmark. */
export function OgWordmark({
  fontSize,
  withMark = false,
}: {
  fontSize: number;
  withMark?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: fontSize * 0.35 }}>
      {withMark ? <OgMark height={fontSize * 1.05} /> : null}
      <div
        style={{
          display: "flex",
          fontFamily: "Plus Jakarta Sans",
          fontSize,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: OG_COLORS.fg,
        }}
      >
        hookli
        <span style={{ color: OG_COLORS.accent }}>.</span>
      </div>
    </div>
  );
}
