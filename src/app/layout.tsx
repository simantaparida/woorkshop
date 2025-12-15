import type { Metadata, Viewport } from 'next';
import { Inter, Comfortaa } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';

const inter = Inter({ subsets: ['latin'] });
const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-comfortaa',
});

const siteUrl = 'https://uxworks.app';
const siteTitle = 'UX Works — Decide what to build next, in 10 minutes';
const siteDescription = 'UX Works is a lightweight prioritization workshop for product & UX teams. Create a session, invite your team, and get aligned in 10 minutes — no signup required.';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | UX Works',
  },
  description: siteDescription,
  keywords: ['prioritization', 'product management', 'UX', 'workshop', 'feature voting', 'team alignment'],
  authors: [{ name: 'UX Works' }],
  creator: 'UX Works',
  publisher: 'UX Works',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'UX Works',
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'UX Works - Decide what to build next',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/og.png'],
    creator: '@uxworks_app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'UX Works',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/favicon-192x192.png`,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'hello@uxworks.app',
          contactType: 'customer service',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'UX Works',
        description: siteDescription,
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en" className={comfortaa.variable} suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/og.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
