const Help = () => {
  return (
    <section aria-labelledby="help-heading" className="text-sm">
      <h2 id="help-heading" className="mb-2 font-display text-lg font-semibold">
        Need help?
      </h2>
      <p className="text-muted">
        <a
          href="https://ig.me/m/bylayerd"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-ink underline underline-offset-4"
        >
          Message us on Instagram
        </a>{" "}
        with your order number. If a piece arrives with a defect, we&apos;ll
        replace it or refund you in full.
      </p>
    </section>
  )
}

export default Help
