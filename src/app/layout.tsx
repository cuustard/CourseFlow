import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-dm-sans",
});

const dmMono = DM_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--font-dm-mono",
});

export const metadata: Metadata = {
    title: "CourseFlow — Grades & Deadlines",
    description:
        "Track university grades against Lancaster classifications and plan every deadline on one timeline.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${dmSans.variable} ${dmMono.variable} antialiased`}
        >
            <body>{children}</body>
        </html>
    );
}
