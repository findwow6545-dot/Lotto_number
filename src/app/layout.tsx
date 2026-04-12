import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PREMIUM AI LOTTO - AI 데이터 분석 로또 생성기",
  description: "최신 AI를 활용한 로또번호 데이터 분석 및 생성 서비스입니다. 행운의 6+1 번호를 지금 확인하세요.",
  keywords: ["로또", "번호생성", "로또명당", "로또추첨", "복권"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
