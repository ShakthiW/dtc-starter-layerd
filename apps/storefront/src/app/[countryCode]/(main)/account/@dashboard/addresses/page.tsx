import { Metadata } from "next"
import { notFound } from "next/navigation"

import AccountPageHeader from "@modules/account/components/account-page-header"
import AddressBook from "@modules/account/components/address-book"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Addresses | LAYERD",
  description: "Your saved delivery addresses.",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <AccountPageHeader
        title="Addresses"
        description="Saved addresses appear at checkout, so you don't have to type them again."
      />
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
