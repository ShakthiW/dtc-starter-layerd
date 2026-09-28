"use client"

import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react"
import { BarsThree, XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { NAV_ITEMS, SOCIAL_LINKS } from "@modules/layout/nav-items"
import { Fragment, useState } from "react"

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="small:hidden flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
        data-testid="nav-menu-button"
      >
        <BarsThree />
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={close} className="relative z-[60] small:hidden">
          <TransitionChild
            as={Fragment}
            enter="transition-opacity duration-200 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="transition-transform duration-200 ease-out"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-150 ease-in"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel
              className="fixed inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-paper px-4 py-4"
              data-testid="nav-menu-popup"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold tracking-[0.2em]">
                  LAYERD
                </span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
                  data-testid="close-menu-button"
                >
                  <XMark />
                </button>
              </div>

              <nav className="mt-8 flex-1">
                <ul className="flex flex-col">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.href} className="border-b border-line">
                      <LocalizedClientLink
                        href={item.href}
                        onClick={close}
                        className="flex min-h-[52px] items-center font-display text-xl"
                      >
                        {item.label}
                      </LocalizedClientLink>
                    </li>
                  ))}
                  <li className="border-b border-line">
                    <LocalizedClientLink
                      href="/account"
                      onClick={close}
                      className="flex min-h-[52px] items-center text-base text-muted"
                    >
                      Account
                    </LocalizedClientLink>
                  </li>
                </ul>
              </nav>

              <div className="flex gap-x-6 text-sm text-muted">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[44px] items-center hover:text-ink"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  )
}

export default SideMenu
