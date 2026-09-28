"use client"

import { signup } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div className="flex w-full flex-col" data-testid="register-page">
      <h2 className="font-display text-2xl font-semibold">
        Create your account
      </h2>
      <p className="mb-6 mt-1 text-sm text-muted">
        It takes a minute, and your details are filled in next time you check
        out.
      </p>
      {message?.state === "verification_required" && (
        <div
          role="status"
          className="mb-6 rounded-rounded bg-paper p-4 text-sm text-ink"
          data-testid="register-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please check your inbox to verify your email, then sign in.
        </div>
      )}
      <form className="flex w-full flex-col" action={formAction}>
        <div className="flex w-full flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              name="first_name"
              required
              autoComplete="given-name"
              data-testid="first-name-input"
            />
            <Input
              label="Last name"
              name="last_name"
              required
              autoComplete="family-name"
              data-testid="last-name-input"
            />
          </div>
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Mobile number (optional)"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            minLength={8}
            aria-describedby="password-hint"
            data-testid="password-input"
          />
          <p id="password-hint" className="-mt-2 text-sm text-muted">
            At least 8 characters.
          </p>
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <SubmitButton
          size="large"
          className="mt-6 w-full"
          data-testid="register-submit-button"
        >
          Create account
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="font-medium text-ink underline underline-offset-4"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}

export default Register
