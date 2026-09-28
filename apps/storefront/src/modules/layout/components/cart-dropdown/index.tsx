"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { ShoppingBag } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <PopoverButton as="div" className="h-full">
          <LocalizedClientLink
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-ink/5"
            href="/cart"
            aria-label={`Cart, ${totalItems} ${
              totalItems === 1 ? "item" : "items"
            }`}
            data-testid="nav-cart-link"
          >
            <ShoppingBag />
            {totalItems > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold tabular-nums text-white"
              >
                {totalItems}
              </span>
            )}
          </LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="absolute right-0 top-[calc(100%+11px)] hidden w-[400px] flex-col rounded-large border border-line bg-paper text-ink shadow-xl small:flex"
            data-testid="nav-cart-dropdown"
          >
            <div className="flex items-baseline justify-between px-5 pb-2 pt-5">
              <h3 className="font-display text-lg font-semibold">Your cart</h3>
              {totalItems > 0 && (
                <span className="text-sm tabular-nums text-muted">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            {cartState && cartState.items?.length ? (
              <>
                <ul className="max-h-[360px] divide-y divide-line overflow-y-auto px-5">
                  {[...cartState.items]
                    .sort((a, b) =>
                      (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                    )
                    .map((item) => (
                      <li
                        key={item.id}
                        className="flex gap-3 py-4"
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="w-16 shrink-0"
                          tabIndex={-1}
                          aria-hidden="true"
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <LocalizedClientLink
                                href={`/products/${item.product_handle}`}
                                className="line-clamp-2 text-sm font-medium underline-offset-4 hover:underline"
                                data-testid="product-link"
                              >
                                {item.product_title ?? item.title}
                              </LocalizedClientLink>
                              <LineItemOptions
                                variant={item.variant}
                                data-testid="cart-item-variant"
                                data-value={item.variant}
                              />
                              <p
                                className="text-sm text-muted"
                                data-testid="cart-item-quantity"
                                data-value={item.quantity}
                              >
                                Qty {item.quantity}
                              </p>
                            </div>
                            <LineItemPrice
                              item={item}
                              currencyCode={cartState.currency_code}
                            />
                          </div>
                          <DeleteButton
                            id={item.id}
                            className="-ml-1 mt-1 w-fit px-1"
                            data-testid="cart-item-remove-button"
                          >
                            Remove
                          </DeleteButton>
                        </div>
                      </li>
                    ))}
                </ul>
                <div className="flex flex-col gap-4 border-t border-line p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Subtotal</span>
                    <span
                      className="font-display text-lg font-semibold tabular-nums"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <p className="-mt-2 text-sm text-muted">
                    Delivery Rs 450, free over Rs 10,000. Cash on delivery
                    available.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <LocalizedClientLink
                      href="/cart"
                      className="btn-secondary"
                      data-testid="go-to-cart-button"
                    >
                      View cart
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/checkout?step=address"
                      className="btn-primary"
                    >
                      Checkout
                    </LocalizedClientLink>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 px-5 pb-8 pt-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
                  <ShoppingBag aria-hidden="true" />
                </span>
                <p className="text-sm text-muted">Your cart is empty.</p>
                <LocalizedClientLink
                  href="/store"
                  onClick={close}
                  className="btn-primary"
                >
                  Start shopping
                </LocalizedClientLink>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
