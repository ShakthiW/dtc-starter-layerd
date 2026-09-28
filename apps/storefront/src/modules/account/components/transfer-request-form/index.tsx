"use client"

import { createTransferRequest } from "@lib/data/orders"
import { CheckCircleSolid, XMark } from "@medusajs/icons"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { Input } from "@modules/common/components/ui"
import { useActionState, useEffect, useState } from "react"

/**
 * Lets a signed-in customer claim an order they placed as a guest, by its
 * order ID. Medusa then asks the order's email to confirm the transfer.
 */
export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <details className="group rounded-large border border-line p-5">
      <summary className="flex min-h-[40px] cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
        Can&apos;t find an order you placed as a guest?
        <span className="text-muted group-open:hidden">Add it</span>
      </summary>
      <p className="mt-2 text-sm text-muted">
        Enter the order ID to connect it to this account.
      </p>
      <form
        action={formAction}
        className="mt-4 flex flex-col gap-3 small:flex-row"
      >
        <Input name="order_id" placeholder="Order ID" aria-label="Order ID" />
        <SubmitButton variant="secondary" className="shrink-0">
          Request transfer
        </SubmitButton>
      </form>
      {!state.success && state.error && (
        <p role="alert" className="mt-3 text-sm text-rose-700">
          {state.error}
        </p>
      )}
      {showSuccess && (
        <div
          role="status"
          className="mt-4 flex items-start justify-between gap-3 rounded-rounded bg-sage p-4 text-sm"
        >
          <div className="flex gap-2">
            <CheckCircleSolid
              aria-hidden="true"
              className="mt-0.5 text-accent-ink"
            />
            <p className="text-ink">
              Transfer requested for order {state.order?.id}. Confirm it from
              the email sent to {state.order?.email}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            aria-label="Dismiss"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-ink/5"
          >
            <XMark />
          </button>
        </div>
      )}
    </details>
  )
}
