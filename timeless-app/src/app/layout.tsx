import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0F0F1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Timeless Games - Play Free Online Games (Poki & CrazyGames Style)",
  description: "Play thousands of free online games in your browser on Timeless Games. Fast, responsive, no downloads required. Action, racing, multiplayer, puzzle, and 2-player games.",
  keywords: ["free online games", "poki games", "crazy games", "html5 games", "unblocked games", "multiplayer games", "browser games"],
  authors: [{ name: "Timeless Games Team" }],
  openGraph: {
    title: "Timeless Games - Play Free Online Games",
    description: "Discover endless fun with high quality HTML5 games on Timeless Games. Play instantly on mobile, tablet, and desktop.",
    url: "https://timelessgames.com",
    siteName: "Timeless Games",
    images: [
      {
        url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Timeless Games Portal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Timeless Games - Free Online Games",
    description: "Play top games directly in your browser. No downloads or installs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0F0F1A] text-zinc-100 antialiased selection:bg-[#7B3FF2] selection:text-white">
        {children}
      </body>
    </html>
  );
}
