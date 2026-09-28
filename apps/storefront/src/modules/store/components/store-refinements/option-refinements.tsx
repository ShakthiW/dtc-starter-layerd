"use client"

import { clx } from "@modules/common/components/ui"
import { useRefinementList } from "react-instantsearch"

import { COLOR_SWATCHES, OPTION_VALUES_ATTRIBUTE } from "./attributes"

const FACET_LIMIT = 200

/** Options that describe a purchase, not the product (gift card amounts). */
const HIDDEN_OPTION_GROUPS = ["Amount"]

type OptionGroup = {
  title: string
  values: {
    label: string
    value: string
    count: number
    isRefined: boolean
  }[]
}

function groupItems(
  items: ReturnType<typeof useRefinementList>["items"]
): OptionGroup[] {
  const groups = new Map<string, OptionGroup>()

  for (const item of items) {
    const separator = item.label.indexOf(":")

    if (separator < 1) {
      continue
    }

    const title = item.label.slice(0, separator)
    const label = item.label.slice(separator + 1)

    if (!groups.has(title)) {
      groups.set(title, { title, values: [] })
    }

    groups.get(title)!.values.push({
      label,
      value: item.value,
      count: item.count,
      isRefined: item.isRefined,
    })
  }

  return Array.from(groups.values())
}

/**
 * One group per product option (Color, Finish, Style...), as toggle chips.
 * Only options present in the current results appear, so a category page
 * shows just the options its products have.
 */
const OptionRefinements = () => {
  const { items, refine } = useRefinementList({
    attribute: OPTION_VALUES_ATTRIBUTE,
    limit: FACET_LIMIT,
    // Alphabetical keeps a colour list stable as counts move around.
    sortBy: ["name:asc"],
    operator: "and",
  })

  const groups = groupItems(items).filter(
    (group) => !HIDDEN_OPTION_GROUPS.includes(group.title)
  )

  if (!groups.length) {
    return null
  }

  return (
    <>
      {groups.map((group) => {
        const isColor = /^colou?r$/i.test(group.title)

        return (
          <fieldset key={group.title} className="border-t border-line pt-5">
            <legend className="float-left mb-3 w-full text-sm font-medium text-ink">
              {isColor ? "Colour" : group.title}
            </legend>
            <div className="clear-both flex flex-wrap gap-2">
              {group.values.map((value) => (
                <button
                  key={value.value}
                  type="button"
                  onClick={() => refine(value.value)}
                  aria-pressed={value.isRefined}
                  className={clx(
                    "flex min-h-[40px] items-center gap-x-2 rounded-full border px-3.5 text-sm transition-colors duration-150",
                    value.isRefined
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-surface text-ink hover:border-ink"
                  )}
                  data-testid="option-refinement"
                >
                  {isColor && COLOR_SWATCHES[value.label] && (
                    <span
                      aria-hidden="true"
                      className="h-3.5 w-3.5 rounded-full border border-line-strong/40"
                      style={{ backgroundColor: COLOR_SWATCHES[value.label] }}
                    />
                  )}
                  {value.label}
                  <span
                    className={clx(
                      "tabular-nums",
                      value.isRefined ? "text-white/70" : "text-muted"
                    )}
                  >
                    {value.count}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        )
      })}
    </>
  )
}

export default OptionRefinements
