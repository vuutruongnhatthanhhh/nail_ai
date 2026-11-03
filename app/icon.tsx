import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 8,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 14,
            height: 19,
            background: "#fdf8f6",
            borderRadius: "50% 50% 12% 12% / 65% 65% 14% 14%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 5,
            right: 6,
            width: 3,
            height: 3,
            background: "#fdf8f6",
            borderRadius: "50%",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
