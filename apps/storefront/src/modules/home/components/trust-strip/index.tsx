import { Cash, MapPin, ShieldCheck, TruckFast } from "@medusajs/icons"

const ITEMS = [
  { icon: TruckFast, title: "Island-wide delivery", body: "Rs 450, free over Rs 10,000" },
  { icon: Cash, title: "Cash on delivery", body: "Pay when your parcel arrives" },
  { icon: MapPin, title: "Made in Sri Lanka", body: "Printed to order in our studio" },
  { icon: ShieldCheck, title: "Defects covered", body: "Replaced or refunded, no fuss" },
]

const TrustStrip = () => {
  return (
    <section aria-label="Why shop with LAYERD" className="border-y border-line bg-surface">
      <ul className="content-container grid grid-cols-2 gap-x-6 gap-y-6 py-8 small:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex items-start gap-3">
            <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-accent-ink" />
            <div>
              <p className="text-sm font-medium text-ink">{title}</p>
              <p className="text-sm text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default TrustStrip
