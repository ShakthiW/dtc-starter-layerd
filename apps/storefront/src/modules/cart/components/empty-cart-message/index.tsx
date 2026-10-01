import { ShoppingBag } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { NAV_ITEMS } from "@modules/layout/nav-items"

const EmptyCartMessage = () => {
  const categories = NAV_ITEMS.filter((item) => item.href.startsWith("/categories"))

  return (
    <div
      className="mx-auto flex max-w-lg flex-col items-center gap-5 py-20 text-center small:py-28"
      data-testid="empty-cart-message"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
        <ShoppingBag aria-hidden="true" />
      </span>
      <h1 className="font-serif leading-[1.05] text-4xl">
        Your cart is empty
      </h1>
      <p className="text-muted">
        Find a lamp for your desk, a vase for your shelf or a small gift for
        someone. Everything is printed to order in Sri Lanka.
      </p>
      <LocalizedClientLink href="/store" className="btn-primary">
        Start shopping
      </LocalizedClientLink>
      <ul className="mt-2 flex flex-wrap justify-center gap-2">
        {categories.map((item) => (
          <li key={item.href}>
            <LocalizedClientLink
              href={item.href}
              className="flex min-h-[40px] items-center rounded-full border border-line bg-surface px-4 text-sm hover:border-ink"
            >
              {item.label}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default EmptyCartMessage
