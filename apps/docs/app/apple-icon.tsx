import { ImageResponse } from "next/og";

/* Apple-touch-icon: Carbon dark tile (#151C27) with Classic React Cyan (#61DAFB) hook mark */
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
          backgroundColor: "#151C27",
        }}
      >
        <svg width={96} height={122} viewBox="-13 -3 110 140" fill="none">
          <path
            d="M84 10 V82 A42 42 0 1 1 0 82 V58"
            stroke="#61DAFB"
            strokeWidth={26}
            strokeLinecap="round"
          />
          <circle cx={42} cy={82} r={15} fill="#61DAFB" />
        </svg>
      </div>
    ),
    size,
  );
}
