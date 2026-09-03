import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BottomNav from "@/components/BottomNav";
import db from "@/lib/db";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Permite zoom manual (acessibilidade) — o zoom automático em foco de input
  // é evitado no CSS, garantindo 16px de fonte nos campos.
  maximumScale: 5,
  userScalable: true,
  // Faz o conteúdo ir até as bordas do aparelho; as safe-areas cuidam do notch.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
    { media: "(prefers-color-scheme: light)", color: "#090d16" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await db.campaignSettings.findUnique({
      where: { id: "default" },
    });

    const title = settings?.title || "Ação dos Amigos | Honda CG 160";
    const description =
      settings?.subtitle ||
      "Concorra a uma Motocicleta Honda CG 160 com apuração pela Loteria Federal. Apenas R$ 30 por número ou 3 por R$ 63!";

    return {
      title: {
        default: title,
        template: `%s | ${title}`,
      },
      description,
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://acaodosamigos.com.br"),
      openGraph: {
        title,
        description,
        siteName: "Ação dos Amigos",
        type: "website",
        locale: "pt_BR",
        images: [
          {
            url: "/images/banner-rifa.jpg",
            width: 1200,
            height: 630,
            alt: "Ação dos Amigos Honda CG 160 Start",
          },
          {
            url: "/images/moto/moto-hero.jpg",
            width: 800,
            height: 1000,
            alt: "Motocicleta Honda CG 160 Start",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["/images/banner-rifa.jpg"],
      },
      icons: {
        icon: [
          { url: "/favicon.ico" },
          { url: "/favicon.png", type: "image/png" },
          { url: "/images/logo-acao.jpg" },
        ],
        apple: "/apple-touch-icon.png",
        shortcut: "/favicon.ico",
      },
    };
  } catch {
    return {
      title: "Ação dos Amigos | Honda CG 160 Start",
      description: "Concorra a uma motocicleta Honda CG 160 Start com apuração transparente pela Loteria Federal. 3 cotas por R$ 63!",
      icons: {
        icon: "/favicon.ico",
      },
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let whatsappNumber = "+5548992178109";
  let whatsappMessage = "Olá! Vim pelo site da Ação dos Amigos e gostaria de tirar uma dúvida.";

  try {
    const settings = await db.campaignSettings.findUnique({
      where: { id: "default" },
    });
    if (settings) {
      whatsappNumber = settings.whatsappNumber;
      whatsappMessage = settings.whatsappMessage;
    }
  } catch (e) {
    // fallback defaults
  }

  return (
    <html lang="pt-BR" className={`${inter.variable} dark scroll-smooth`}>
      <body className="bg-background text-foreground font-sans min-h-screen flex flex-col selection:bg-primary-500 selection:text-black">
        <Navbar />
        <main className="flex-1 w-full pb-bottomnav lg:pb-0">
          {children}
        </main>
        <Footer />
        <WhatsAppButton phone={whatsappNumber} message={whatsappMessage} />
        <BottomNav />
      </body>
    </html>
  );
}
