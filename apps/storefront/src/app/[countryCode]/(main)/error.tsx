"use client"

import { useEffect } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"

// Shown inside the site's nav and footer when a page fails to render, for
// example while the backend restarts
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] px-6 text-center">
      <h1 className="text-2xl-semi text-ink">Something went wrong</h1>
      <p className="text-small-regular text-muted max-w-sm">
        This page didn&apos;t load. Please try again in a moment.
      </p>
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={reset}
          className="rounded-circle bg-ink px-5 py-2 text-small-semi text-paper hover:bg-ink/90"
        >
          Try again
        </button>
        <InteractiveLink href="/">Go to frontpage</InteractiveLink>
      </div>
    </div>
  )
}
