import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "流转账本",
  description: "保留原币的中日双向代购与日常记账工具",
  manifest: "/manifest.webmanifest",
  themeColor: "#4667d9",
  appleWebApp: { capable: true, title: "流转账本" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}<script dangerouslySetInnerHTML={{ __html: `if ("serviceWorker" in navigator) addEventListener("load",()=>navigator.serviceWorker.register("/sw.js"));` }} /></body>
    </html>
  );
}
