"use client"

import { Plus } from "@medusajs/icons"
import { Button } from "@modules/common/components/ui"
import { useActionState, useEffect, useState } from "react"

import { addCustomerAddress } from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import ErrorMessage from "@modules/checkout/components/error-message"
import Modal from "@modules/common/components/modal"
import AddressFields from "../address-fields"

const AddAddress = ({
  region,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

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

  return (
    <>
      <button
        type="button"
        className="flex h-full min-h-[180px] w-full flex-col items-center justify-center gap-3 rounded-large border border-dashed border-line-strong/50 p-5 text-sm font-medium text-ink transition-colors hover:border-ink"
        onClick={open}
        data-testid="add-address-button"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
          <Plus aria-hidden="true" />
        </span>
        Add an address
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>Add an address</Modal.Title>
        <form action={formAction}>
          <Modal.Body>
            <AddressFields
              idPrefix="new-address"
              countryCode={region.countries?.[0]?.iso_2 ?? "lk"}
            />
            <ErrorMessage error={formState.error} data-testid="address-error" />
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
            <SubmitButton data-testid="save-button">Save address</SubmitButton>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress
