import { CheckCircleSolid } from "@medusajs/icons"
import { Button } from "@modules/common/components/ui"
import { useEffect } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  "data-testid"?: string
}

/**
 * One editable row of the profile: its current value with an Edit button
 * that opens the form in place. Success and error messages are announced.
 */
const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "Something went wrong. Please try again.",
  children,
  "data-testid": dataTestid,
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()
  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    toggle()
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div className="py-5 text-sm" data-testid={dataTestid}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-muted">{label}</span>
          {typeof currentInfo === "string" ? (
            <span
              className="break-words font-medium text-ink"
              data-testid="current-info"
            >
              {currentInfo}
            </span>
          ) : (
            currentInfo
          )}
        </div>
        <Button
          variant="secondary"
          size="small"
          className="shrink-0"
          onClick={handleToggle}
          type={state ? "reset" : "button"}
          aria-expanded={state}
          data-testid="edit-button"
          data-active={state}
        >
          {state ? "Cancel" : "Edit"}
        </Button>
      </div>

      <div aria-live="polite">
        {isSuccess && (
          <p
            className="mt-3 flex items-center gap-2 text-ink"
            data-testid="success-message"
          >
            <CheckCircleSolid aria-hidden="true" className="text-accent-ink" />
            {label} updated.
          </p>
        )}
        {isError && (
          <p
            role="alert"
            className="mt-3 text-rose-700"
            data-testid="error-message"
          >
            {errorMessage}
          </p>
        )}
      </div>

      {state && (
        <div className="mt-4 flex flex-col gap-4">
          {children}
          <Button
            isLoading={pending}
            className="w-full small:w-fit"
            type="submit"
            data-testid="save-button"
          >
            Save changes
          </Button>
        </div>
      )}
    </div>
  )
}

export default AccountInfo
