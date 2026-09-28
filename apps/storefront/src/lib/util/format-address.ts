type AddressLike = {
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
}

const COUNTRY_NAMES: Record<string, string> = { lk: "Sri Lanka" }

/**
 * An address as display lines: name, street, "City, District, Postcode",
 * country. Empty and repeated parts are dropped, so an address never shows a
 * stray comma or "Kandy, Kandy".
 */
export function formatAddressLines(address?: AddressLike | null): string[] {
  if (!address) {
    return []
  }

  const country = address.country_code
    ? COUNTRY_NAMES[address.country_code.toLowerCase()] ??
      address.country_code.toUpperCase()
    : ""

  return [
    [address.first_name, address.last_name].filter(Boolean).join(" "),
    [address.address_1, address.address_2].filter(Boolean).join(", "),
    // "Kandy, Kandy" reads as a mistake when the city is also the district
    [
      address.city,
      address.province !== address.city ? address.province : null,
      address.postal_code,
    ]
      .filter(Boolean)
      .join(", "),
    country,
  ].filter(Boolean)
}
