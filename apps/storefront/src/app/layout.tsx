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
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${sans.variable} ${serif.variable}`}
    >
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
