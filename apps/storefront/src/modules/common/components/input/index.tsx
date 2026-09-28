import { Label } from "@modules/common/components/ui"
import React, { useImperativeHandle, useState } from "react"

import Eye from "@modules/common/icons/eye"
import EyeOff from "@modules/common/icons/eye-off"

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
  topLabel?: string
}

/**
 * A form field with its label always visible above it. Floating labels hide
 * what a field is for once it's filled and overlap autofilled values.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { type, name, label, touched: _touched, errors: _errors, required, topLabel, ...props },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const inputId = props.id ?? name
    const inputType = type === "password" && showPassword ? "text" : type

    useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div className="flex w-full flex-col gap-1.5">
        {topLabel && (
          <Label className="mb-1 text-sm font-medium text-ink">{topLabel}</Label>
        )}
        <label htmlFor={inputId} className="text-sm text-ink">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-accent-ink">
              *
            </span>
          )}
        </label>
        <div className="relative flex w-full">
          <input
            type={inputType}
            id={inputId}
            name={name}
            required={required}
            className="block h-12 w-full appearance-none rounded-rounded border border-line-strong bg-surface px-4 text-base text-ink focus:border-ink focus:outline-none small:text-sm"
            {...props}
            ref={inputRef}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-0 top-0 flex h-12 items-center px-4 text-muted hover:text-ink"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
