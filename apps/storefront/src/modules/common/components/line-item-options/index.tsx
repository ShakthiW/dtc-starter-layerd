import { HttpTypes } from "@medusajs/types"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

/**
 * The chosen options as "Colour: Black · Style: Key Tag Version". Products
 * without variants carry a placeholder "Default" option, which is skipped.
 */
const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  const parts = (variant?.options ?? [])
    .filter((o) => o.value && o.value !== "Default")
    .map((o) => {
      const title = o.option?.title
      const label = title && /^colou?r$/i.test(title) ? "Colour" : title
      return label ? `${label}: ${o.value}` : o.value
    })

  const text =
    parts.join(" · ") ||
    (variant?.title && variant.title !== "Default" ? variant.title : "")

  if (!text) {
    return null
  }

  return (
    <p
      data-testid={dataTestid}
      data-value={dataValue}
      className="truncate text-sm text-muted"
    >
      {text}
    </p>
  )
}

export default LineItemOptions
