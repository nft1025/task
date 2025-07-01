import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Time Manager',
  description: 'Created by Jasmine Lapidario, Edward Jeshua Leonardo, John Carlo Salamanca, Neil Francis Teresa',
  generator: 'HALIBURTON',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
