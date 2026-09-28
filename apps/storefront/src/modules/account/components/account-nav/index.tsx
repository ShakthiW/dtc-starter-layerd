"use client"

import {
  ArrowRightOnRectangle,
  House,
  MapPin,
  ShoppingBag,
  User,
} from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const LINKS = [
  { href: "/account", label: "Overview", icon: House, testId: "overview-link" },
  {
    href: "/account/orders",
    label: "Orders",
    icon: ShoppingBag,
    testId: "orders-link",
  },
  {
    href: "/account/profile",
    label: "Profile",
    icon: User,
    testId: "profile-link",
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    icon: MapPin,
    testId: "addresses-link",
  },
]

/**
 * Account navigation: a sidebar on desktop, a scrollable tab row on mobile,
 * so every account page is one tap away on any screen.
 */
const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const current = route.split(`/${countryCode}`)[1] ?? ""

  const isActive = (href: string) =>
    href === "/account" ? current === href : current.startsWith(href)

  return (
    <nav aria-label="Account" data-testid="account-nav">
      <div className="mb-4 hidden small:block">
        <p className="font-display text-lg font-semibold">
          {customer?.first_name
            ? `Hello, ${customer.first_name}`
            : "Your account"}
        </p>
        <p className="truncate text-sm text-muted">{customer?.email}</p>
      </div>

      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar small:mx-0 small:flex-col small:gap-1 small:px-0">
        {LINKS.map(({ href, label, icon: Icon, testId }) => {
          const active = isActive(href)
          return (
            <li key={href} className="shrink-0">
              <LocalizedClientLink
                href={href}
                aria-current={active ? "page" : undefined}
                className={clx(
                  "flex min-h-[44px] items-center gap-3 rounded-full px-4 text-sm transition-colors duration-150",
                  active
                    ? "bg-ink text-white"
                    : "border border-line bg-surface text-ink hover:border-ink small:border-transparent small:bg-transparent small:hover:bg-surface"
                )}
                data-testid={testId}
              >
                <Icon aria-hidden="true" className="hidden small:block" />
                {label}
              </LocalizedClientLink>
            </li>
          )
        })}
        <li className="shrink-0 small:mt-4 small:border-t small:border-line small:pt-4">
          <button
            type="button"
            onClick={() => signout(countryCode)}
            className="flex min-h-[44px] items-center gap-3 rounded-full border border-line bg-surface px-4 text-sm text-muted transition-colors hover:text-ink small:w-full small:border-transparent small:bg-transparent small:hover:bg-surface"
            data-testid="logout-button"
          >
            <ArrowRightOnRectangle
              aria-hidden="true"
              className="hidden small:block"
            />
            Log out
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default AccountNav
