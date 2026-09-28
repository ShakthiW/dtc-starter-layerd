"use client"

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react"
import React, { Fragment } from "react"

type SearchDrawerProps = {
  isOpen: boolean
  close: () => void
  children: React.ReactNode
}

/**
 * The search overlay: a panel that drops from the top under a scrim on
 * desktop and fills the screen on mobile. Escape and the scrim close it.
 */
const SearchDrawer = ({ isOpen, close, children }: SearchDrawerProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[75]" onClose={close}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <TransitionChild
            as={Fragment}
            enter="transform transition ease-out duration-200"
            enterFrom="-translate-y-4 opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="transform transition ease-in duration-150"
            leaveFrom="translate-y-0 opacity-100"
            leaveTo="-translate-y-4 opacity-0"
          >
            <DialogPanel
              className="mx-auto flex h-full w-full max-w-3xl flex-col bg-paper small:mt-6 small:h-auto small:max-h-[80vh] small:rounded-large small:shadow-xl"
              data-testid="search-drawer"
            >
              <DialogTitle className="sr-only">Search products</DialogTitle>
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

export default SearchDrawer
