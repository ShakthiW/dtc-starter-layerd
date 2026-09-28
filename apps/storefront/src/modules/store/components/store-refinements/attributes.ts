import { PRODUCT_INDEX_NAME, priceAttribute } from "@lib/search-client"

export const OPTION_VALUES_ATTRIBUTE = "option_values"
export const CATEGORY_ATTRIBUTE = "category"
export const COLLECTION_ATTRIBUTE = "collection"
// The index calls the product's tags "labels".
export const LABELS_ATTRIBUTE = "labels"

export const getSortOptions = (currencyCode: string) => {
  const minPrice = priceAttribute("min_price", currencyCode)

  return [
    { value: PRODUCT_INDEX_NAME, label: "Featured" },
    { value: `${PRODUCT_INDEX_NAME}/sort/created_at:desc`, label: "Newest" },
    {
      value: `${PRODUCT_INDEX_NAME}/sort/${minPrice}:asc`,
      label: "Price: low to high",
    },
    {
      value: `${PRODUCT_INDEX_NAME}/sort/${minPrice}:desc`,
      label: "Price: high to low",
    },
    { value: `${PRODUCT_INDEX_NAME}/sort/title:asc`, label: "Name: A to Z" },
  ]
}

/** Swatch colours for the Color option; the name is always shown beside it. */
export const COLOR_SWATCHES: Record<string, string> = {
  Black: "#1C1917",
  White: "#FFFFFF",
  Gray: "#A8A29E",
  Grey: "#A8A29E",
  Brown: "#7C5A45",
  Pink: "#E9A6B8",
  Orange: "#EA7B2C",
}
