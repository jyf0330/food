import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今天吃什么 · 帮你想好买什么、做什么、怎么做",
  description:
    "面向深圳家庭的 AI 买菜做饭助手。输入家庭情况，自动生成完整晚餐方案：菜单、买菜清单、做饭顺序、详细做法。",
};

export const viewport: Viewport = {
  themeColor: "#ff6b35",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
