import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import { SRI_LANKA_DISTRICTS } from "@lib/constants"
import NativeSelect from "@modules/common/components/native-select"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.address_2": cart?.shipping_address?.address_2 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    // Sri Lanka only: a single-country region needs no country picker
    "shipping_address.country_code":
      cart?.shipping_address?.country_code ||
      (cart?.region?.countries?.length === 1
        ? cart.region.countries[0].iso_2 ?? ""
        : ""),
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.address_2": address?.address_2 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))
    }

    if (email) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        email: email,
      }))
    }
  }

  useEffect(() => {
    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart]) // Add cart as a dependency

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as unknown as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4 text-sm font-medium text-ink">
          Contact details
        </legend>
        <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
          <Input
            label="Mobile number"
            name="shipping_address.phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            pattern="[0-9+ ()-]{9,16}"
            title="Enter a Sri Lankan mobile number, for example 077 123 4567."
            value={formData["shipping_address.phone"]}
            onChange={handleChange}
            required
            data-testid="shipping-phone-input"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            data-testid="shipping-email-input"
          />
        </div>
        <p className="text-sm text-muted">
          Our courier calls this number before delivering.
        </p>
      </fieldset>

      <fieldset className="mt-8 flex flex-col gap-4">
        <legend className="mb-4 text-sm font-medium text-ink">
          Delivery address
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            name="shipping_address.first_name"
            autoComplete="given-name"
            value={formData["shipping_address.first_name"]}
            onChange={handleChange}
            required
            data-testid="shipping-first-name-input"
          />
          <Input
            label="Last name"
            name="shipping_address.last_name"
            autoComplete="family-name"
            value={formData["shipping_address.last_name"]}
            onChange={handleChange}
            required
            data-testid="shipping-last-name-input"
          />
        </div>
        <Input
          label="House number and street"
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="shipping-address-input"
        />
        <Input
          label="Landmark or apartment (optional)"
          name="shipping_address.address_2"
          autoComplete="address-line2"
          value={formData["shipping_address.address_2"]}
          onChange={handleChange}
          data-testid="shipping-address-2-input"
        />
        <div className="grid grid-cols-1 gap-4 small:grid-cols-3">
          <Input
            label="City or town"
            name="shipping_address.city"
            autoComplete="address-level2"
            value={formData["shipping_address.city"]}
            onChange={handleChange}
            required
            data-testid="shipping-city-input"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="shipping_address.province" className="text-sm text-ink">
              District
              <span aria-hidden="true" className="ml-0.5 text-accent-ink">
                *
              </span>
            </label>
            <NativeSelect
              id="shipping_address.province"
              name="shipping_address.province"
              placeholder="Choose a district"
              aria-label="District"
              autoComplete="address-level1"
              value={formData["shipping_address.province"]}
              onChange={handleChange}
              required
              data-testid="shipping-province-input"
            >
              {SRI_LANKA_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </NativeSelect>
          </div>
          <Input
            label="Postal code (optional)"
            name="shipping_address.postal_code"
            autoComplete="postal-code"
            inputMode="numeric"
            value={formData["shipping_address.postal_code"]}
            onChange={handleChange}
            data-testid="shipping-postal-code-input"
          />
        </div>
        {(cart?.region?.countries?.length ?? 0) > 1 ? (
          <CountrySelect
            name="shipping_address.country_code"
            autoComplete="country"
            region={cart?.region}
            value={formData["shipping_address.country_code"]}
            onChange={handleChange}
            required
            data-testid="shipping-country-select"
          />
        ) : (
          <input
            type="hidden"
            name="shipping_address.country_code"
            value={formData["shipping_address.country_code"]}
          />
        )}
      </fieldset>

      <div className="my-8">
        <Checkbox
          label="Billing address is the same as delivery address"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
    </>
  )
}

export default ShippingAddress
