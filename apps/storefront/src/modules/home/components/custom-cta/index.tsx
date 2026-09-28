import { CUSTOM_PRINT_MAILTO, STUDIO_EMAIL } from "@modules/layout/nav-items"

const STEPS = [
  "Email us your 3D file",
  "We reply with a quote",
  "You approve",
  "We print and deliver",
]

/**
 * Custom work is limited to printing a customer's own 3D model: they email
 * the file and their requirements, and the studio replies with a quote.
 */
const CustomCta = () => {
  return (
    <section
      id="custom"
      className="scroll-mt-32 content-container py-16 small:py-24"
    >
      <div className="grid gap-10 border-t border-line pt-16 small:grid-cols-2 small:gap-16">
        <div className="flex flex-col items-start gap-5">
          <p className="eyebrow">Print your model</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight small:text-4xl">
            Have a 3D model ready?
          </h2>
          <p className="max-w-md leading-relaxed text-muted">
            If you already have a 3D file of what you want, we can print it.
            Email it to us with the size, colour, quantity and when you need it,
            and we&apos;ll reply with a quote.
          </p>
          <a href={CUSTOM_PRINT_MAILTO} className="btn-primary">
            Email your model
          </a>
          <p className="text-sm text-muted">
            Or write to{" "}
            <a
              href={`mailto:${STUDIO_EMAIL}`}
              className="font-medium text-ink underline underline-offset-4"
            >
              {STUDIO_EMAIL}
            </a>
          </p>
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
