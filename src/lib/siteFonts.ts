import { Space_Grotesk, Space_Mono } from "next/font/google";

export const siteSans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-site-sans",
  display: "swap",
});

export const siteMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-site-mono",
  display: "swap",
});
