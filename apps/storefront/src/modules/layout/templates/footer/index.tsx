import { listCategories } from "@lib/data/categories"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SOCIAL_LINKS } from "@modules/layout/nav-items"

const linkClass =
  "inline-flex min-h-[32px] items-center text-sm text-white/70 transition-colors duration-200 hover:text-white"

export default async function Footer() {
  const categories = await listCategories()
  const topLevel = (categories ?? [])
    .filter((c) => !c.parent_category)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="content-container py-16 small:py-20">
        <div className="grid grid-cols-2 gap-10 small:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 small:col-span-1 max-w-xs">
            <LocalizedClientLink href="/" className="inline-flex" aria-label="LAYERD home">
              <Image
                src="/brand/layerd-white.png"
                alt="LAYERD"
                width={1200}
                height={507}
                sizes="160px"
                className="h-14 w-auto"
              />
            </LocalizedClientLink>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Modern objects for considered spaces, designed and 3D printed
              layer by layer in Sri Lanka.
            </p>
          </div>

          <div>
            <h2 className="eyebrow text-white/50">Shop</h2>
            <ul className="mt-4 flex flex-col">
              <li>
                <LocalizedClientLink href="/store" className={linkClass}>
                  Shop all
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/spaces" className={linkClass}>
                  Spaces
                </LocalizedClientLink>
              </li>
              {topLevel.map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink
                    href={`/categories/${c.handle}`}
                    className={linkClass}
                    data-testid="category-link"
                  >
                    {c.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-white/50">Delivery & returns</h2>
            <ul className="mt-4 flex flex-col gap-y-2 text-sm text-white/70">
              <li>Island-wide delivery, Rs 450</li>
              <li>Free over Rs 10,000</li>
              <li>Cash on delivery</li>
              <li>Defects replaced or refunded</li>
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-white/50">Studio</h2>
            <ul className="mt-4 flex flex-col">
              <li>
                <LocalizedClientLink href="/#custom" className={linkClass}>
                  Print your model
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/#process" className={linkClass}>
                  How it&apos;s made
                </LocalizedClientLink>
              </li>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClass}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/60 small:flex-row small:justify-between">
          <p>© {new Date().getFullYear()} LAYERD. All rights reserved.</p>
          <p>Designed and 3D printed in Sri Lanka.</p>
        </div>
      </div>
    </footer>
  )
}
