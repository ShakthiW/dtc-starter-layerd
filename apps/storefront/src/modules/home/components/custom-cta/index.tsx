const STEPS = ["Send your idea", "Get a quote", "Approve", "We print and deliver"]

const CustomCta = () => {
  return (
    <section id="custom" className="scroll-mt-32 content-container py-16 small:py-24">
      <div className="grid gap-10 border-t border-line pt-16 small:grid-cols-2 small:gap-16">
        <div className="flex flex-col items-start gap-5">
          <p className="eyebrow">Custom orders</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight small:text-4xl">
            Have something in mind?
          </h2>
          <p className="max-w-md leading-relaxed text-muted">
            Names, logos, desk accessories or a one-off gift. Tell us what you
            need and we&apos;ll get back to you with a quote.
          </p>
          <a
            href="https://ig.me/m/bylayerd"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            Message us on Instagram
          </a>
        </div>
        <ol className="grid grid-cols-2 gap-4 self-center">
          {STEPS.map((step, index) => (
            <li key={step} className="rounded-rounded bg-surface p-5">
              <span className="font-display text-sm tabular-nums text-muted">
                0{index + 1}
              </span>
              <p className="mt-2 font-medium">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default CustomCta
