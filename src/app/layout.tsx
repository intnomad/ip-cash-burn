import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientChatbot from '@/components/ClientChatbot'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'BlueLicht - AI IP Intelligence Platform',
  description: 'Advanced AI-powered intellectual property strategy and cost analysis platform for innovative companies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning={true}>
        {children}
        <ClientChatbot />
        <Analytics />
      </body>
    </html>
  )
} 