import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Photoboth by Siliwangi Code Developer (SICODEV)',
  description:
    'Photobooth application developed by Siliwangi Code Developer (SICODEV) for event documentation purposes.',
  icons: {
    icon: [
      {
        url: '/sicodev1.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/sicodev1.svg',
    apple: '/sicodev1.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-black`}
      >
        <div className="relative z-0 h-full w-full">
          <div className="fixed bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-purple-600/30 via-purple-500/20 to-transparent blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-500/20 via-purple-400/10 to-transparent blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex h-full w-full flex-col">
            <div className="flex-1 overflow-hidden">{children}</div>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  )
}
