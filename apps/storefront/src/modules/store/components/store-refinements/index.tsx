"use client"

import { COLLECTION_ATTRIBUTE } from "./attributes"
import CurrentRefinements from "./current-refinements"
import OnSaleToggle from "./on-sale-toggle"
import OptionRefinements from "./option-refinements"
import PriceRange from "./price-range"
import RefinementGroup from "./refinement-group"

type StoreRefinementsProps = {
  currencyCode: string
  /** Hidden on a collection page, where every hit shares one collection. */
  showCollections?: boolean
}

/**
 * The filter panel, used as the desktop sidebar and inside the mobile sheet.
 * Every group hides itself when the current results give it nothing to show.
 */
const StoreRefinements = ({
  currencyCode,
  showCollections = true,
}: StoreRefinementsProps) => {
  return (
    <div className="flex flex-col gap-y-5">
      <CurrentRefinements currencyCode={currencyCode} />
      <PriceRange currencyCode={currencyCode} />
      <OnSaleToggle currencyCode={currencyCode} />
      <OptionRefinements />
      {showCollections && (
        <RefinementGroup attribute={COLLECTION_ATTRIBUTE} title="Collection" />
      )}
    </div>
  )
}

export default StoreRefinements
