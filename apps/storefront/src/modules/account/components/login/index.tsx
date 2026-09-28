import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div className="flex w-full flex-col" data-testid="login-page">
      <h2 className="font-display text-2xl font-semibold">Welcome back</h2>
      <p className="mb-6 mt-1 text-sm text-muted">
        Sign in with the email you used for your account.
      </p>
      {message?.state === "verification_required" && (
        <div
          role="status"
          className="mb-6 rounded-rounded bg-paper p-4 text-sm text-ink"
          data-testid="login-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please verify your email, then sign in.
        </div>
      )}
      <form className="w-full" action={formAction}>
        <div className="flex w-full flex-col gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />
        <SubmitButton
          size="large"
          data-testid="sign-in-button"
          className="mt-6 w-full"
        >
          Sign in
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New to LAYERD?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="font-medium text-ink underline underline-offset-4"
        >
          Create an account
        </button>
      </p>
    </div>
  )
}

export default Login
