"use client"

import { clx } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { NAV_ITEMS } from "@modules/layout/nav-items"
import { useParams, usePathname } from "next/navigation"

const NavLinks = () => {
  const pathname = usePathname()
  const { countryCode } = useParams()

  return (
    <ul className="hidden small:flex items-center gap-x-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          !item.href.includes("#") &&
          pathname.startsWith(`/${countryCode}${item.href}`)

        return (
          <li key={item.href}>
            <LocalizedClientLink
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={clx(
                "relative inline-flex h-11 items-center px-3 text-sm transition-colors duration-200",
                isActive ? "text-ink font-medium" : "text-muted hover:text-ink"
              )}
            >
              {item.label}
              {isActive && (
                <span className="absolute inset-x-3 bottom-2 h-px bg-ink" />
              )}
            </LocalizedClientLink>
          </li>
        )
      })}
    </ul>
  )
}

export default NavLinks
