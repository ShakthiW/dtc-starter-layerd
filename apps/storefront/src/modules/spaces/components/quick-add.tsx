"use client"

import { useParams } from "next/navigation"
import { useState, useTransition } from "react"

import { addToCart } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Adds a single-variant product straight from the room. Products with colour
 * or finish options link to their page instead, where the choice is made.
 */
export default function QuickAdd({
  handle,
  variantId,
  tone,
}: {
  handle: string
  variantId: string | null
  tone: "light" | "dark"
}) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState<"idle" | "added" | "error">("idle")

  const base =
    "inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full px-4 text-xs font-medium transition-colors duration-200"
  const solid =
    tone === "dark"
      ? "bg-ink text-white hover:bg-ink/85 small:bg-white small:text-ink small:hover:bg-white/85"
      : "bg-ink text-white hover:bg-ink/85"
  const outline =
    tone === "dark"
      ? "border border-ink text-ink hover:bg-ink hover:text-white small:border-white/70 small:text-white small:hover:bg-white small:hover:text-ink"
      : "border border-ink text-ink hover:bg-ink hover:text-white"

  if (!variantId) {
    return (
      <LocalizedClientLink href={`/products/${handle}`} className={`${base} ${outline}`}>
        Choose
      </LocalizedClientLink>
    )
  }

  return (
    <button
      type="button"
      className={`${base} ${solid} disabled:opacity-60`}
      disabled={pending}
      aria-live="polite"
      onClick={() =>
        startTransition(async () => {
          try {
            await addToCart({ variantId, quantity: 1, countryCode })
            setState("added")
          } catch {
            setState("error")
          }
        })
      }
    >
      {pending ? "Adding" : state === "added" ? "Added" : state === "error" ? "Try again" : "Add to bag"}
    </button>
  )
}
