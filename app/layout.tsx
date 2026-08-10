// fixes-web/app/layout.tsx

import type { Metadata } from 'next'
import { Manrope, Nunito_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/auth-context'
import { CanonicalLink } from '@/components/CanonicalLink'
import { PageTitle } from '@/components/PageTitle'
import { RouteRobots } from '@/components/RouteRobots'
import { SITE_URL } from '@/lib/site'
import './globals.css'

const nunitoSans = Nunito_Sans({ 
  subsets: ["latin"],
  variable: '--font-nunito-sans',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-home-manrope',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  description: 'Access skilled, verified tradies ready to help you build and fix — matched instantly via AI-powered quoting.',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        type: 'image/x-icon',
      },
      {
        url: '/icon-48x48.png',
        type: 'image/png',
        sizes: '48x48',
      },
      {
        url: '/icon-192x192.png',
        type: 'image/png',
        sizes: '192x192',
      },
    ],
    shortcut: '/favicon.ico',
    apple: {
      url: '/apple-icon.png',
      type: 'image/png',
      sizes: '180x180',
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.variable} ${manrope.variable} font-sans antialiased`}>
        <PageTitle />
        <CanonicalLink />
        <RouteRobots />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
