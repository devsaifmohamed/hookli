import { ImageResponse } from "next/og";
import { OG_COLORS, OG_SIZE, OgWordmark, loadOgFonts } from "@/lib/og";
import { TAGLINE } from "@/lib/site";

export const alt = "use(hookli) — Simple React hooks. Typed. SSR-safe. Zero dependencies.";
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
          gap: 40,
          backgroundColor: OG_COLORS.ground,
        }}
      >
        <OgWordmark fontSize={112} />
        <div style={{ fontSize: 34, color: OG_COLORS.gray }}>{TAGLINE}</div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
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
