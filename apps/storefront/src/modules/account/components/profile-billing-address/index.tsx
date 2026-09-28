"use client"

import React, { useActionState, useEffect } from "react"

import { addCustomerAddress, updateCustomerAddress } from "@lib/data/customer"
import { formatAddressLines } from "@lib/util/format-address"
import { HttpTypes } from "@medusajs/types"
import AccountInfo from "../account-info"
import AddressFields from "../address-fields"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
  regions: HttpTypes.StoreRegion[]
}

const ProfileBillingAddress: React.FC<MyInformationProps> = ({
  customer,
  regions,
}) => {
  const [successState, setSuccessState] = React.useState(false)

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )
  const countryCode =
    billingAddress?.country_code ?? regions[0]?.countries?.[0]?.iso_2 ?? "lk"

  const initialState: Record<string, unknown> = {
    isDefaultBilling: true,
    isDefaultShipping: false,
    error: false,
    success: false,
  }

  if (billingAddress) {
    initialState.addressId = billingAddress.id
  }

  const [state, formAction] = useActionState(
    billingAddress ? updateCustomerAddress : addCustomerAddress,
    initialState
  )

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(!!state.success)
  }, [state])

  const lines = formatAddressLines(billingAddress)
  const currentInfo = billingAddress ? (
    <div
      className="flex flex-col font-medium text-ink"
      data-testid="current-info"
    >
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  ) : (
    "Not added yet"
  )

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      <input type="hidden" name="addressId" value={billingAddress?.id} />
      <AccountInfo
        label="Billing address"
        currentInfo={currentInfo}
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={typeof state.error === "string" ? state.error : undefined}
        clearState={clearState}
        data-testid="account-billing-address-editor"
      >
        <AddressFields
          idPrefix="billing"
          defaults={billingAddress}
          countryCode={countryCode}
          defaultPhone={customer.phone}
        />
      </AccountInfo>
    </form>
  )
}

export default ProfileBillingAddress
