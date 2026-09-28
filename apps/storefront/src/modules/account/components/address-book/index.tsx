import React from "react"

import AddAddress from "../address-card/add-address"
import EditAddress from "../address-card/edit-address-modal"
import { HttpTypes } from "@medusajs/types"

type AddressBookProps = {
  customer: HttpTypes.StoreCustomer
  region: HttpTypes.StoreRegion
}

const AddressBook: React.FC<AddressBookProps> = ({ customer, region }) => {
  const { addresses } = customer
  return (
    <ul className="grid grid-cols-1 gap-4 small:grid-cols-2">
      {addresses.map((address) => (
        <li key={address.id}>
          <EditAddress region={region} address={address} />
        </li>
      ))}
      <li>
        <AddAddress region={region} addresses={addresses} />
      </li>
    </ul>
  )
}

export default AddressBook
