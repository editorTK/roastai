import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const APP_NAME = "RoastAI";
const APP_DEFAULT_TITLE = "RoastAI - Generate Hilarious AI Roasts | Personalized Comedy";
const APP_TITLE_TEMPLATE = "%s | RoastAI";
const APP_DESCRIPTION = "Unleash the power of AI to create personalized and funny roasts! Describe your target, set the intensity, and let RoastAI do the rest. Perfect for parties, friends, or just a good laugh. Available in English and Spanish.";
const APP_URL = "https://roastai.yourdomain.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json", 
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  keywords: [
    "AI roast generator", 
    "personalized comedy", 
    "funny roasts", 
    "AI humor", 
    "roast bot", 
    "online roast", 
    "English roast", 
    "Spanish roast",
    "GPT roasts",
    "AI comedian"
  ],
  authors: [{ name: 'The RoastAI Team', url: APP_URL }],
  creator: 'The RoastAI Team',
  publisher: 'The RoastAI Team',
  category: 'entertainment',
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    url: APP_URL,
    images: [
      {
        url: `https://picsum.photos/seed/roastai-og/1200/630`, 
        width: 1200,
        height: 630,
        alt: "RoastAI - AI-Powered Roast Generator",
      },
    ],
    locale: 'en_US', 
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: [`https://picsum.photos/seed/roastai-twitter/1200/600`], 
    creator: "@YourTwitterHandle", 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
  icons: null, 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script src="https://js.puter.com/v2/" strategy="beforeInteractive" />
        {children}
        <Toaster />
      </body>
    </html>
  );
        }
