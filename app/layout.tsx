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
  title: {
    default: "P2Q - Prompt to Quiz",
    template: "%s | P2Q",
  },
  description:
    "Create quizzes with AI, import them as JSON, and track your attempts.",
};

const themeScript = `(function(){try{var saved=localStorage.getItem("p2q-theme");var preferred=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var theme=saved==="dark"||saved==="light"?saved:preferred;document.documentElement.dataset.theme=theme;document.documentElement.classList.toggle("dark",theme==="dark");}catch(error){document.documentElement.dataset.theme="light";}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
