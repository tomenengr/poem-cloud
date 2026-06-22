import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "诗云 · Shiyun",
  description: "刘慈欣《诗云》 × 古典诗词 × AI 可视化 | 极致暗黑宇宙风",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-black text-[#f0edff]">
        <Nav />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
