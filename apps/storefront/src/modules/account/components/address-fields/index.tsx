"use client"

import { SRI_LANKA_DISTRICTS } from "@lib/constants"
import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"

type AddressFieldsProps = {
  /** Keeps field ids unique when several address forms share a page. */
  idPrefix: string
  defaults?: Partial<HttpTypes.StoreCustomerAddress> | null
  /** The store ships to one country, so it's sent as a hidden field. */
  countryCode: string
  defaultPhone?: string | null
}

/**
 * The Sri Lankan address form used by the address book and the billing
 * address editor, matching checkout: mobile number, street, optional
 * landmark, city, district and optional postal code.
 */
const AddressFields = ({
  idPrefix,
  defaults,
  countryCode,
  defaultPhone,
}: AddressFieldsProps) => {
  const id = (name: string) => `${idPrefix}-${name}`

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          id={id("first_name")}
          label="First name"
          name="first_name"
          required
          autoComplete="given-name"
          defaultValue={defaults?.first_name ?? undefined}
          data-testid="first-name-input"
        />
        <Input
          id={id("last_name")}
          label="Last name"
          name="last_name"
          required
          autoComplete="family-name"
          defaultValue={defaults?.last_name ?? undefined}
          data-testid="last-name-input"
        />
      </div>
      <Input
        id={id("phone")}
        label="Mobile number"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
        defaultValue={defaults?.phone ?? defaultPhone ?? undefined}
        data-testid="phone-input"
      />
      <Input
        id={id("address_1")}
        label="House number and street"
        name="address_1"
        required
        autoComplete="address-line1"
        defaultValue={defaults?.address_1 ?? undefined}
        data-testid="address-1-input"
      />
      <Input
        id={id("address_2")}
        label="Landmark or apartment (optional)"
        name="address_2"
        autoComplete="address-line2"
        defaultValue={defaults?.address_2 ?? undefined}
        data-testid="address-2-input"
      />
      <div className="grid grid-cols-1 gap-4 small:grid-cols-3">
        <Input
          id={id("city")}
          label="City or town"
          name="city"
          required
          autoComplete="address-level2"
          defaultValue={defaults?.city ?? undefined}
          data-testid="city-input"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id("province")} className="text-sm text-ink">
            District
            <span aria-hidden="true" className="ml-0.5 text-accent-ink">
              *
            </span>
          </label>
          <NativeSelect
            id={id("province")}
            name="province"
            placeholder="Choose a district"
            aria-label="District"
            autoComplete="address-level1"
            defaultValue={defaults?.province ?? ""}
            required
            data-testid="state-input"
          >
            {SRI_LANKA_DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </NativeSelect>
        </div>
        <Input
          id={id("postal_code")}
          label="Postal code (optional)"
          name="postal_code"
          inputMode="numeric"
          autoComplete="postal-code"
          defaultValue={defaults?.postal_code ?? undefined}
          data-testid="postal-code-input"
        />
      </div>
      <input type="hidden" name="country_code" value={countryCode} />
    </div>
  )
}

export default AddressFields
