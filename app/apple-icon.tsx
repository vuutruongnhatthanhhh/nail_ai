import { ImageResponse } from "next/og";

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
          background: "linear-gradient(135deg, #f3b6cc 0%, #d9779a 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 78,
            height: 108,
            background: "#fdf8f6",
            borderRadius: "50% 50% 12% 12% / 65% 65% 14% 14%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 36,
            width: 16,
            height: 16,
            background: "#fdf8f6",
            borderRadius: "50%",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
