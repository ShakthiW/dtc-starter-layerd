"use client"

import { useRefinementList } from "react-instantsearch"

type RefinementGroupProps = {
  attribute: string
  title: string
}

const RefinementGroup = ({ attribute, title }: RefinementGroupProps) => {
  const { items, refine } = useRefinementList({
    attribute,
    limit: 20,
    sortBy: ["name:asc"],
  })

  if (!items.length) {
    return null
  }

  return (
    <fieldset className="border-t border-line pt-5">
      <legend className="float-left mb-3 w-full text-sm font-medium text-ink">
        {title}
      </legend>
      <ul className="clear-both flex flex-col">
        {items.map((item) => (
          <li key={item.value}>
            <label className="flex min-h-[40px] cursor-pointer items-center gap-x-3 text-sm">
              <input
                type="checkbox"
                checked={item.isRefined}
                onChange={() => refine(item.value)}
                className="h-4 w-4 shrink-0 accent-ink"
                data-testid={`refinement-${attribute}`}
              />
              <span className={item.isRefined ? "text-ink" : "text-muted"}>
                {item.label}
              </span>
              <span className="ml-auto tabular-nums text-muted">
                {item.count}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}

export default RefinementGroup
