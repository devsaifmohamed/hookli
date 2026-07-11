import { ImageResponse } from "next/og";
import { OG_COLORS, OG_SIZE, OgWordmark, loadOgFonts } from "@/lib/og";
import { TAGLINE } from "@/lib/site";

export const alt = "hookli. — Simple React hooks. Typed. SSR-safe. Zero dependencies.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
          backgroundColor: OG_COLORS.ground,
          fontFamily: "Plus Jakarta Sans",
        }}
      >
        <OgWordmark fontSize={112} withMark />
        <div style={{ fontSize: 34, color: OG_COLORS.gray }}>{TAGLINE}</div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            fontFamily: "JetBrains Mono",
            fontSize: 26,
            color: OG_COLORS.slate,
          }}
        >
          npm i hookli
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
