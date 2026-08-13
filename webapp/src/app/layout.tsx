import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "大栄製作所 製作・現場管理",
  description: "大栄製作所 社内業務管理アプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
