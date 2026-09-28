import { HttpTypes } from "@medusajs/types"
import { ChevronDownMini } from "@medusajs/icons"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const COUNTRY_NAMES: Record<string, string> = { lk: "Sri Lanka" }

const Section = ({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) => (
  <details open={defaultOpen} className="group border-b border-line">
    <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-medium [&::-webkit-details-marker]:hidden">
      {title}
      <ChevronDownMini
        aria-hidden="true"
        className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
      />
    </summary>
    <div className="pb-6 text-sm leading-relaxed text-muted">{children}</div>
  </details>
)

/** About, Specifications, and Delivery & returns, as collapsible sections. */
const ProductTabs = ({ product }: ProductTabsProps) => {
  const specs = [
    { label: "Material", value: product.material },
    {
      label: "Dimensions",
      value:
        product.length && product.width && product.height
          ? `${product.length} × ${product.width} × ${product.height} mm`
          : null,
    },
    { label: "Weight", value: product.weight ? `${product.weight} g` : null },
    {
      label: "Made in",
      value: product.origin_country
        ? COUNTRY_NAMES[product.origin_country.toLowerCase()] ??
          product.origin_country.toUpperCase()
        : null,
    },
  ].filter((spec) => spec.value)

  return (
    <div className="border-t border-line">
      {product.description && (
        <Section title="About this piece" defaultOpen>
          <p className="whitespace-pre-line" data-testid="product-description">
            {product.description}
          </p>
        </Section>
      )}

      {specs.length > 0 && (
        <Section title="Specifications">
          <dl className="grid grid-cols-[8rem_1fr] gap-y-2">
            {specs.map((spec) => (
              <div key={spec.label} className="contents">
                <dt className="text-muted">{spec.label}</dt>
                <dd className="tabular-nums text-ink">{spec.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4">
            Each piece is 3D printed layer by layer, so fine layer lines are
            part of the finish.
          </p>
        </Section>
      )}

      <Section title="Delivery & returns">
        <ul className="flex flex-col gap-2">
          <li>Island-wide delivery for Rs 450, free on orders over Rs 10,000.</li>
          <li>Pay by cash on delivery when your parcel arrives.</li>
          <li>
            Printed to order in our studio. If a piece arrives with a defect,
            we replace it or refund you in full.
          </li>
        </ul>
      </Section>
    </div>
  )
}

export default ProductTabs
