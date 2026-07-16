import { ImageResponse } from "next/og";
import { OG_COLORS } from "@/lib/og";

/* Apple-touch-icon variant of public/hookli-icon.svg: the hook mark on a
   full-bleed ground tile; iOS applies its own corner mask. */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <svg width={80} height={102} viewBox="-13 -3 110 140" fill="none">
          <path
            d="M84 10 V82 A42 42 0 1 1 0 82 V58"
            stroke={OG_COLORS.accent}
            strokeWidth={26}
            strokeLinecap="round"
          />
          <circle cx={42} cy={82} r={15} fill={OG_COLORS.fg} />
        </svg>
      </div>
    ),
    size,
  );
}
