import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Suyash Pandey — AI · Data · Software · Creative Technology',
  description:
    'An immersive 3D portfolio experience. Scroll to travel through identity, experience, skills and selected work — built by Suyash Pandey.',
  openGraph: {
    title: 'Suyash Pandey — Interactive Portfolio',
    description:
      'The portfolio is an experience, not a webpage. Scroll to explore an interactive digital world.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#08080d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
