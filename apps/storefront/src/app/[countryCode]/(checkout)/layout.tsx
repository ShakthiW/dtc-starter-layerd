import { ArrowLeftMini, LockClosedSolid } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative w-full small:min-h-screen">
      <header className="border-b border-line bg-paper">
        <nav className="content-container flex h-16 items-center justify-between">
          <LocalizedClientLink
            href="/cart"
            className="flex min-h-[44px] flex-1 basis-0 items-center gap-x-2 text-sm text-muted hover:text-ink"
            data-testid="back-to-cart-link"
          >
            <ArrowLeftMini aria-hidden="true" />
            <span className="hidden small:inline">Back to cart</span>
            <span className="small:hidden">Cart</span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="font-display text-xl font-semibold tracking-[0.2em] text-ink"
            data-testid="store-link"
          >
            LAYERD
          </LocalizedClientLink>
          <p className="flex flex-1 basis-0 items-center justify-end gap-x-2 text-sm text-muted">
            <LockClosedSolid aria-hidden="true" />
            <span className="hidden small:inline">Checkout</span>
          </p>
        </nav>
      </header>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
