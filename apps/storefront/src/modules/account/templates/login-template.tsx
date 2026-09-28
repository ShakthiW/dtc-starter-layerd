"use client"

import { CheckCircleSolid } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import Image from "next/image"
import { useState } from "react"

import Login from "@modules/account/components/login"
import Register from "@modules/account/components/register"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const BENEFITS = [
  "Check out faster with your saved delivery address",
  "See every order and where it is",
  "Keep your details in one place",
]

const TABS = [
  { view: LOGIN_VIEW.SIGN_IN, label: "Sign in" },
  { view: LOGIN_VIEW.REGISTER, label: "Create account" },
]

const LoginTemplate = ({ panelImage }: { panelImage?: string | null }) => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN)

  return (
    <div className="grid gap-8 small:grid-cols-2 small:gap-12">
      <section className="flex flex-col justify-between gap-8 rounded-large bg-sage p-6 small:p-10">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">Your account</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight small:text-4xl">
            Welcome to LAYERD
          </h1>
          <p className="max-w-sm leading-relaxed text-muted">
            Sign in or create an account. You can also check out as a guest, no
            account needed.
          </p>
        </div>
        {panelImage && (
          <div className="relative hidden aspect-[16/10] overflow-hidden rounded-rounded small:block">
            <Image
              src={panelImage}
              alt=""
              fill
              sizes="(max-width: 1280px) 45vw, 560px"
              className="object-cover"
            />
          </div>
        )}
        <ul className="flex flex-col gap-3 text-sm">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3">
              <CheckCircleSolid
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-accent-ink"
              />
              <span className="text-ink">{benefit}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-large bg-surface p-6 small:p-10">
        <div
          role="tablist"
          aria-label="Sign in or create an account"
          className="mb-8 grid grid-cols-2 rounded-full bg-paper p-1"
        >
          {TABS.map((tab) => {
            const isActive = currentView === tab.view
            return (
              <button
                key={tab.view}
                type="button"
                role="tab"
                id={`tab-${tab.view}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.view}`}
                onClick={() => setCurrentView(tab.view)}
                className={clx(
                  "min-h-[44px] rounded-full text-sm font-medium transition-colors duration-200",
                  isActive ? "bg-ink text-white" : "text-muted hover:text-ink"
                )}
                data-testid={
                  tab.view === LOGIN_VIEW.REGISTER
                    ? "register-button"
                    : undefined
                }
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${currentView}`}
          aria-labelledby={`tab-${currentView}`}
        >
          {currentView === LOGIN_VIEW.SIGN_IN ? (
            <Login setCurrentView={setCurrentView} />
          ) : (
            <Register setCurrentView={setCurrentView} />
          )}
        </div>
      </section>
    </div>
  )
}

export default LoginTemplate
