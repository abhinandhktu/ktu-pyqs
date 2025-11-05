import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from '@vercel/analytics/react';
import Navbar from '@/components/layout/navbar';
import { Marquee } from '@/components/ui/marquee';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'KTU PYQ Finder - Previous Year Question Papers',
  description: 'Easily find, browse, and download APJ Abdul Kalam Technological University (KTU) previous year question papers (PYQs) for all branches and semesters.',
  keywords: 'KTU, APJ Abdul Kalam Technological University, PYQ, Question Papers, Previous Year Questions, KTU PYQ Finder, Engineering, B.Tech',
  manifest: '/manifest.json',
  verification: {
    google: 'UxZm8TRlYXQwnN3FSNL8_YWDoyHx-UwmSqfQSN9fD_s',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Pixelify+Sans:wght@700&family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-03SCGES35Z"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-03SCGES35Z');
          `}
        </Script>
      </head>
      <body className="font-body antialiased h-full">
        <Marquee className="bg-primary text-primary-foreground font-bold">
          To keep this website live and ad-free, please consider making a small donation. Your support is greatly appreciated!
        </Marquee>
        <Navbar />
        <main>{children}</main>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
