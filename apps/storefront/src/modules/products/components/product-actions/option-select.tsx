import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import { COLOR_SWATCHES } from "@modules/store/components/store-refinements/attributes"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (optionId: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

/** One product option as a row of buttons; colours get a swatch too. */
const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const values = (option.values ?? []).map((v) => v.value)
  const isColor = /^colou?r$/i.test(title)
  const label = isColor ? "Colour" : title

  return (
    <fieldset className="flex flex-col gap-y-3">
      <legend className="mb-3 text-sm text-muted">
        {label}
        {current && <span className="font-medium text-ink">: {current}</span>}
      </legend>
      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {values.map((value) => {
          const isSelected = value === current

          return (
            <button
              type="button"
              key={value}
              onClick={() => updateOption(option.id, value)}
              aria-pressed={isSelected}
              disabled={disabled}
              className={clx(
                "flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-150 disabled:opacity-50",
                isSelected
                  ? "border-ink bg-ink text-white"
                  : "border-line-strong/40 bg-surface text-ink hover:border-ink"
              )}
              data-testid="option-button"
            >
              {isColor && COLOR_SWATCHES[value] && (
                <span
                  aria-hidden="true"
                  className={clx(
                    "h-4 w-4 rounded-full border",
                    isSelected ? "border-white/70" : "border-line-strong/40"
                  )}
                  style={{ backgroundColor: COLOR_SWATCHES[value] }}
                />
              )}
              {value}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default OptionSelect
