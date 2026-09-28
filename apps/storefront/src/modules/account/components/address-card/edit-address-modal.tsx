"use client"

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { formatAddressLines } from "@lib/util/format-address"
import { PencilSquare as Edit, Spinner, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Modal from "@modules/common/components/modal"
import { Button } from "@modules/common/components/ui"
import React, { useActionState, useEffect, useState } from "react"
import AddressFields from "../address-fields"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const cardButton =
  "flex min-h-[40px] items-center gap-2 rounded-full px-3 text-sm text-ink transition-colors hover:bg-ink/5 disabled:opacity-50"

const EditAddress: React.FC<EditAddressProps> = ({ region, address }) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
    addressId: address.id,
  } as { success: boolean; error: string | null; addressId: string })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  const [name, ...lines] = formatAddressLines(address)

  return (
    <>
      <div
        className="flex h-full min-h-[180px] w-full flex-col justify-between gap-4 rounded-large bg-surface p-5"
        data-testid="address-container"
      >
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-medium text-ink" data-testid="address-name">
            {name}
          </p>
          {lines.map((line) => (
            <p key={line} className="text-muted" data-testid="address-address">
              {line}
            </p>
          ))}
          {address.phone && <p className="text-muted">{address.phone}</p>}
          <div className="mt-1 flex flex-wrap gap-2">
            {address.is_default_shipping && (
              <span className="rounded-full bg-sage px-2.5 py-0.5 text-xs text-ink">
                Default delivery
              </span>
            )}
            {address.is_default_billing && (
              <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs text-ink">
                Billing
              </span>
            )}
          </div>
        </div>
        <div className="-ml-3 flex items-center gap-1">
          <button
            type="button"
            className={cardButton}
            onClick={open}
            aria-label={`Edit address for ${name}`}
            data-testid="address-edit-button"
          >
            <Edit aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className={cardButton}
            onClick={removeAddress}
            disabled={removing}
            aria-label={`Remove address for ${name}`}
            data-testid="address-delete-button"
          >
            {removing ? (
              <Spinner aria-hidden="true" className="animate-spin" />
            ) : (
              <Trash aria-hidden="true" />
            )}
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>Edit address</Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <AddressFields
              idPrefix={`address-${address.id}`}
              defaults={address}
              countryCode={
                address.country_code ?? region.countries?.[0]?.iso_2 ?? "lk"
              }
            />
            <ErrorMessage
              error={formState.error}
              data-testid="update-address-error"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="reset"
              variant="secondary"
              onClick={close}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <SubmitButton data-testid="save-button">Save changes</SubmitButton>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default EditAddress
