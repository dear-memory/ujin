import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ujin Photo - 작가님을 위한 촬영 안내",
  description: "디어메모리 본식스냅 계약 및 관리 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
