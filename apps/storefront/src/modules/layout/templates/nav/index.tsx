import Image from "next/image"
import { Suspense } from "react"

import { ShoppingBag, User } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import NavLinks from "@modules/layout/components/nav-links"
import Search from "@modules/layout/components/search"
import SideMenu from "@modules/layout/components/side-menu"

const iconButton =
  "flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5 transition-colors duration-200"

export default function Nav() {
  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <p className="bg-ink px-4 py-2 text-center text-xs text-white">
        Free delivery over Rs 10,000
        <span className="hidden xsmall:inline"> · Cash on delivery island-wide</span>
      </p>
      <header className="border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
        <nav className="content-container flex h-16 items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2 small:gap-x-8">
            <SideMenu />
            <LocalizedClientLink
              href="/"
              className="flex h-11 items-center"
              aria-label="LAYERD home"
              data-testid="nav-store-link"
            >
              <Image
                src="/brand/layerd-black.png"
                alt="LAYERD"
                width={1200}
                height={507}
                priority
                sizes="96px"
                className="h-9 w-auto"
              />
            </LocalizedClientLink>
            <NavLinks />
          </div>

          <div className="flex items-center">
            <Search />
            <LocalizedClientLink
              className={`${iconButton} hidden small:flex`}
              href="/account"
              aria-label="Account"
              data-testid="nav-account-link"
            >
              <User />
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className={iconButton}
                  href="/cart"
                  aria-label="Cart"
                  data-testid="nav-cart-link"
                >
                  <ShoppingBag />
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
