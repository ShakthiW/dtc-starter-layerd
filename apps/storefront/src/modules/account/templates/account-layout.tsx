import React from "react"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div
      className="content-container py-8 small:py-14"
      data-testid="account-page"
    >
      <div className={customer ? "" : "mx-auto max-w-5xl"}>
        {customer ? (
          <div className="grid grid-cols-1 gap-8 small:grid-cols-[240px_1fr] small:gap-12">
            <div>
              <AccountNav customer={customer} />
            </div>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        ) : (
          children
        )}

        <p className="mt-12 border-t border-line pt-8 text-sm text-muted">
          Need help with your account or an order?{" "}
          <a
            href="https://ig.me/m/bylayerd"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-ink underline underline-offset-4"
          >
            Message us on Instagram
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export default AccountLayout
