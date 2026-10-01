import { ChevronRightMini, MapPin, ShoppingBag, User } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OrderOverview from "../order-overview"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const RECENT_ORDERS = 3

const Overview = ({ customer, orders }: OverviewProps) => {
  const addressCount = customer?.addresses?.length ?? 0
  const orderCount = orders?.length ?? 0
  const missing = getMissingProfileDetails(customer)

  const tiles = [
    {
      href: "/account/orders",
      icon: ShoppingBag,
      label: "Orders",
      value: `${orderCount} ${orderCount === 1 ? "order" : "orders"}`,
      testId: "orders-count",
    },
    {
      href: "/account/addresses",
      icon: MapPin,
      label: "Addresses",
      value: `${addressCount} saved`,
      testId: "addresses-count",
    },
    {
      href: "/account/profile",
      icon: User,
      label: "Profile",
      value: missing.length ? `Add your ${missing.join(" and ")}` : "All set",
      testId: "customer-profile-completion",
    },
  ]

  return (
    <div className="flex flex-col gap-10" data-testid="overview-page-wrapper">
      <header className="flex flex-col gap-1">
        <h1
          className="font-serif leading-[1.05] text-4xl"
          data-testid="welcome-message"
          data-value={customer?.first_name}
        >
          Hello{customer?.first_name ? `, ${customer.first_name}` : ""}
        </h1>
        <p className="text-muted">
          Signed in as{" "}
          <span
            className="text-ink"
            data-testid="customer-email"
            data-value={customer?.email}
          >
            {customer?.email}
          </span>
        </p>
      </header>

      <ul className="grid gap-3 small:grid-cols-3 small:gap-4">
        {tiles.map(({ href, icon: Icon, label, value, testId }) => (
          <li key={href}>
            <LocalizedClientLink
              href={href}
              className="group flex h-full items-center gap-4 rounded-large bg-surface p-4 transition-colors hover:ring-1 hover:ring-ink small:flex-col small:items-stretch small:gap-3 small:p-5"
            >
              <span className="flex items-center justify-between">
                <Icon aria-hidden="true" className="text-accent-ink" />
                <ChevronRightMini
                  aria-hidden="true"
                  className="hidden text-muted group-hover:text-ink small:block"
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 small:gap-3">
                <span className="text-sm text-muted">{label}</span>
                <span className="font-medium text-ink" data-testid={testId}>
                  {value}
                </span>
              </span>
              <ChevronRightMini
                aria-hidden="true"
                className="text-muted small:hidden"
              />
            </LocalizedClientLink>
          </li>
        ))}
      </ul>

      <section
        aria-labelledby="recent-orders-heading"
        className="flex flex-col gap-4"
      >
        <div className="flex items-end justify-between">
          <h2
            id="recent-orders-heading"
            className="font-display text-xl font-semibold"
          >
            Recent orders
          </h2>
          {orderCount > RECENT_ORDERS && (
            <LocalizedClientLink
              href="/account/orders"
              className="text-sm font-medium text-ink underline underline-offset-4"
            >
              See all orders
            </LocalizedClientLink>
          )}
        </div>
        <div data-testid="orders-wrapper">
          <OrderOverview orders={(orders ?? []).slice(0, RECENT_ORDERS)} />
        </div>
      </section>
    </div>
  )
}

/** What the profile still lacks, in plain words, for the Profile tile. */
const getMissingProfileDetails = (customer: HttpTypes.StoreCustomer | null) => {
  if (!customer) {
    return []
  }

  const missing: string[] = []
  if (!customer.phone) {
    missing.push("mobile number")
  }
  if (!customer.addresses?.some((address) => address.is_default_billing)) {
    missing.push("billing address")
  }
  return missing
}

export default Overview
