"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { isSimpleProduct } from "@lib/util/product"
import { Cash, CheckCircleSolid, MapPin, TruckFast } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

type AddState = "idle" | "adding" | "added" | "error"

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

const DELIVERY_POINTS = [
  { icon: TruckFast, text: "Island-wide delivery, Rs 450. Free over Rs 10,000." },
  { icon: Cash, text: "Cash on delivery available." },
  { icon: MapPin, text: "Printed to order in our Sri Lankan studio." },
]

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const countryCode = useParams().countryCode as string

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [addState, setAddState] = useState<AddState>("idle")
  const isAdding = addState === "adding"

  // Start from the variant in the URL, or the first one, so the price shown
  // is always a real one rather than "From".
  useEffect(() => {
    const fromUrl = product.variants?.find(
      (v) => v.id === searchParams.get("v_id")
    )
    const initial = fromUrl ?? product.variants?.[0]
    if (initial) {
      setOptions(optionsAsKeymap(initial.options) ?? {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    return product.variants?.find((v) =>
      isEqual(optionsAsKeymap(v.options), options)
    )
  }, [product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({ ...prev, [optionId]: value }))
    setAddState("idle")
  }

  // Keep the selected variant in the URL so the page can be shared as-is
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = selectedVariant?.id ?? null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString(), { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant])

  const inStock = useMemo(() => {
    if (!selectedVariant) {
      return false
    }
    if (!selectedVariant.manage_inventory || selectedVariant.allow_backorder) {
      return true
    }
    return (selectedVariant.inventory_quantity || 0) > 0
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return

    setAddState("adding")
    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })
      setAddState("added")
    } catch {
      setAddState("error")
    }
  }

  const canAdd = inStock && !!selectedVariant && !disabled && !isAdding
  const buttonLabel = !selectedVariant
    ? "Choose an option"
    : !inStock
    ? "Out of stock"
    : isAdding
    ? "Adding..."
    : "Add to cart"

  const showOptions = !isSimpleProduct(product)

  return (
    <div className="flex flex-col gap-y-6">
      <ProductPrice product={product} variant={selectedVariant} />

      {showOptions && (
        <div id="product-options" className="flex flex-col gap-y-5 scroll-mt-32">
          {(product.options || []).map((option) => (
            <OptionSelect
              key={option.id}
              option={option}
              current={options[option.id]}
              updateOption={setOptionValue}
              title={option.title ?? ""}
              data-testid="product-options"
              disabled={!!disabled || isAdding}
            />
          ))}
        </div>
      )}

      <div ref={actionsRef} className="flex flex-col gap-y-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAdd}
          className="btn-primary h-12 w-full text-base disabled:opacity-50"
          data-testid="add-product-button"
        >
          {buttonLabel}
        </button>

        <div aria-live="polite" className="text-sm">
          {addState === "added" && (
            <p className="flex items-center gap-2 text-ink">
              <CheckCircleSolid aria-hidden="true" className="text-accent-ink" />
              Added to your cart.
              <LocalizedClientLink
                href="/cart"
                className="font-medium underline underline-offset-4"
              >
                View cart
              </LocalizedClientLink>
            </p>
          )}
          {addState === "error" && (
            <p className="text-rose-700" role="alert">
              Couldn&apos;t add this to your cart. Please try again.
            </p>
          )}
        </div>
      </div>

      <ul className="flex flex-col gap-y-3 rounded-rounded bg-surface p-5 text-sm">
        {DELIVERY_POINTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3">
            <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-accent-ink" />
            <span className="text-ink">{text}</span>
          </li>
        ))}
      </ul>

      <MobileActions
        product={product}
        variant={selectedVariant}
        showOptions={showOptions}
        canAdd={canAdd}
        buttonLabel={buttonLabel}
        handleAddToCart={handleAddToCart}
        show={!inView}
      />
    </div>
  )
}
