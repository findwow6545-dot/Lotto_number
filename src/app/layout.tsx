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
  title: "Premium Lotto - 스마트 로또 번호 생성기",
  description: "최첨단 알고리즘과 수려한 디자인으로 제공되는 프리미엄 로또 번호 생성 서비스입니다. 행운의 5세트 번호를 지금 확인하세요.",
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
