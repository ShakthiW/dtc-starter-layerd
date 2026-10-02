import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Geist, Instrument_Serif } from "next/font/google"
import "styles/globals.css"

// Geist carries UI and display headings; its geometry matches the stencil
// wordmark. Instrument Serif is the editorial voice for room and page titles.
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  applicationName: "LAYERD",
  description:
    "Lamps, vases, desk organisers and gifts, designed and 3D printed layer by layer in Sri Lanka.",
  // The share image itself comes from app/opengraph-image.jpg
  openGraph: { siteName: "LAYERD", locale: "en_LK", type: "website" },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${sans.variable} ${serif.variable}`}
      // Browser extensions (Grammarly, password managers) add attributes to
      // <html> and <body> before React loads. This ignores only those two
      // tags' attributes; mismatches anywhere inside are still reported.
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
