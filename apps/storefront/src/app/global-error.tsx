"use client"

// Last resort when the root layout itself fails, so it brings its own <html>
// and inline styles (the app's CSS may not have loaded)
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#faf9f6",
          color: "#1a1a1a",
        }}
      >
        <h1 style={{ fontSize: 24, margin: 0 }}>Something went wrong</h1>
        <p style={{ margin: 0, color: "#6b6b6b" }}>
          LAYERD didn&apos;t load. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            border: 0,
            borderRadius: 999,
            padding: "10px 20px",
            background: "#1a1a1a",
            color: "#faf9f6",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
