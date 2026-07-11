import { ImageResponse } from "next/og";
import { OG_COLORS, loadOgFonts } from "@/lib/og";

/* {h} monogram — apple-touch-icon variant of public/hookli-icon.svg.
   Full-bleed ground tile; iOS applies its own corner mask. */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: OG_COLORS.ground,
          fontSize: 84,
          fontWeight: 700,
        }}
      >
        <span style={{ color: OG_COLORS.slate }}>{"{"}</span>
        <span style={{ color: OG_COLORS.accent }}>h</span>
        <span style={{ color: OG_COLORS.slate }}>{"}"}</span>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
