const ErrorMessage = ({
  error,
  "data-testid": dataTestid,
}: {
  error?: string | null
  "data-testid"?: string
}) => {
  if (!error) {
    return null
  }

  return (
    <p role="alert" className="pt-2 text-sm text-rose-700" data-testid={dataTestid}>
      {error}
    </p>
  )
}

export default ErrorMessage
