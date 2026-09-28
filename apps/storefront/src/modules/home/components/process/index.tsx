const STEPS = [
  {
    number: "01",
    title: "Designed in the studio",
    body: "Every piece starts as a sketch, then a 3D model we test and refine until it feels right in the hand.",
  },
  {
    number: "02",
    title: "Printed layer by layer",
    body: "We print in PLA, a plant-based material, one fine layer at a time. Those layers are the texture you see and feel.",
  },
  {
    number: "03",
    title: "Finished and checked",
    body: "Each print is cleaned up and checked before it is packed. If it arrives with a defect, we replace or refund it.",
  },
]

const Process = () => {
  return (
    <section id="process" className="scroll-mt-32 bg-surface">
      <div className="content-container py-16 small:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">How it&apos;s made</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight small:text-4xl">
            Built layer by layer
          </h2>
        </div>
        <ol className="mt-12 grid gap-10 small:grid-cols-3 small:gap-8">
          {STEPS.map((step) => (
            <li key={step.number} className="border-t border-ink pt-6">
              <span className="font-display text-sm tabular-nums text-muted">
                {step.number}
              </span>
              <h3 className="mt-3 font-display text-xl font-medium">
                {step.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default Process
