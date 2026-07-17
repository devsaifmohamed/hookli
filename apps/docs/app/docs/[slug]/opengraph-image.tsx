import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { CATEGORY_LABELS, getHook } from "@/lib/hooks-registry";
import { OG_COLORS, OG_SIZE, OgWordmark, loadOgFonts } from "@/lib/og";

export const alt = "hookli hook documentation";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hook = getHook(slug);
  if (!hook) notFound();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: OG_COLORS.ground,
          fontFamily: "Plus Jakarta Sans",
        }}
      >
        <OgWordmark fontSize={36} withMark />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: OG_COLORS.gray,
            }}
          >
            {CATEGORY_LABELS[hook.category]}
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 92,
              fontWeight: 700,
              color: OG_COLORS.accent,
            }}
          >
            {hook.name}
          </div>
          <div style={{ fontSize: 34, color: OG_COLORS.gray }}>
            {hook.description}
          </div>
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontSize: 26,
            color: OG_COLORS.gray,
          }}
        >
          npm i hookli
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
