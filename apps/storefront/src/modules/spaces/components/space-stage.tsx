"use client"

import Image from "next/image"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Act, Box, Space } from "../types"
import QuickAdd from "./quick-add"
import { useKeyframeSnap } from "./use-keyframe-snap"

export type SpaceProduct = {
  handle: string
  title: string
  price: string | null
  /** Set only when the product has a single variant, so it can be added here. */
  variantId: string | null
}

type Props = {
  space: Space
  products: Record<string, SpaceProduct>
  /** Low-res data URL for the first plate, shown while it loads. */
  placeholder?: string
  /** Shown over the scene, e.g. a link back to all spaces. */
  back?: { href: string; label: string }
}

const NAV_OFFSET = 96 // announcement bar + header, both sticky above the stage
const HOLD = 0.42 // default share of each act spent settled before moving on

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const centre = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 })

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  query.addEventListener("change", callback)
  return () => query.removeEventListener("change", callback)
}
const getReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Where the camera sits for one act, for the current stage size. */
function cameraFor(act: Act, aspect: number, vw: number, vh: number) {
  const layerW = vh * aspect
  const wide = vw / vh >= 1.15
  const contain = Math.min(vw / layerW, 1)
  const cover = Math.max(vw / layerW, 1)
  const focus = act.layout === "focus"
  // Desktop frames the object on the left and keeps the right for the label;
  // phones frame it in the upper half above the bottom sheet.
  const room = focus
    ? wide
      ? { w: vw * 0.5, h: vh * 0.66, ax: 0.34, ay: 0.5 }
      : { w: vw * 0.86, h: vh * 0.42, ax: 0.5, ay: 0.33 }
    : { w: vw, h: vh, ax: 0.5, ay: 0.5 }
  const frame = !wide && act.phoneFrame ? act.phoneFrame : act.frame
  let scale = Math.min(room.w / (frame.w * layerW), room.h / (frame.h * vh))
  // On phones the photograph is already as tall as the screen, so a focus act
  // zooms further to have room to lift the object above the label sheet.
  const floor =
    act.fit === "contain" && wide
      ? contain
      : focus && !wide
      ? cover * 1.7
      : cover
  scale = Math.max(scale, floor)
  const c = centre(frame)
  return { scale, cx: c.x, cy: c.y, ax: room.ax, ay: room.ay }
}

/** The plate an act ends on, once its light has finished changing. */
const endPlate = (act: Act) =>
  act.light?.reveal?.plate ?? act.light?.fade?.to ?? act.scene

type Layer = { plate: string; opacity: number; mask?: string }

/** Which plates show, and how, at a point in an act's own clock. */
function lightFor(space: Space, act: Act, within: number): Layer[] {
  const layers: Layer[] = [{ plate: act.scene, opacity: 1 }]
  const { fade, reveal } = act.light ?? {}
  if (fade) {
    layers.push({
      plate: fade.to,
      opacity: clamp((within - fade.from) / (fade.until - fade.from)),
    })
  }
  if (reveal) {
    const pools = reveal.at.map((handle, n) => {
      const box = space.objects.find((o) => o.handle === handle)?.box
      const r = clamp((within - reveal.start - n * reveal.step) / 0.1) * (reveal.radius ?? 26)
      if (!box || r <= 0) return null
      const c = centre(box)
      return `radial-gradient(circle at ${c.x * 100}% ${c.y * 100}%, #000 ${
        r * 0.55
      }%, transparent ${r}%)`
    })
    const fill = clamp(
      (within - reveal.fill[0]) / (reveal.fill[1] - reveal.fill[0])
    )
    const shown = pools.some(Boolean) || fill > 0
    layers.push({
      plate: reveal.plate,
      opacity: shown ? 1 : 0,
      mask:
        fill >= 1
          ? "none"
          : [
              ...pools.filter(Boolean),
              `linear-gradient(rgba(0,0,0,${fill}), rgba(0,0,0,${fill}))`,
            ].join(", "),
    })
  }
  return layers
}

export default function SpaceStage({
  space,
  products,
  placeholder,
  back,
}: Props) {
  const { acts, objects } = space
  const aspect = space.plate.width / space.plate.height
  const total = acts.reduce((sum, act) => sum + act.span, 0)
  const reduced = useSyncExternalStore(
    subscribeMotion,
    getReducedMotion,
    () => false
  )
  const [active, setActive] = useState(0)

  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const turnRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const plates = useRef<Record<string, HTMLDivElement | null>>({})
  const blurs = useRef<Record<string, HTMLDivElement | null>>({})
  const hotspots = useRef<Record<string, HTMLAnchorElement | null>>({})
  const leaderRef = useRef<SVGLineElement>(null)
  const activeRef = useRef(0)

  // Frame locks: document scroll positions of every keyframe, with the act
  // each belongs to, plus the hand-off to the shop grid below.
  const stopPositions = useCallback(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return []
    const top = section.getBoundingClientRect().top + window.scrollY
    const travel = section.offsetHeight - stage.clientHeight
    const points: { act: number; y: number }[] = []
    let cursor = 0
    acts.forEach((act, index) => {
      for (const stop of act.stops ?? [(act.hold ?? HOLD) / 2]) {
        points.push({
          act: index,
          y: top - NAV_OFFSET + ((cursor + stop * act.span) / total) * travel,
        })
      }
      cursor += act.span
    })
    points.push({
      act: acts.length,
      y: top + section.offsetHeight - NAV_OFFSET,
    })
    return points
  }, [acts, total])
  const keyframes = useCallback(
    () => stopPositions().map((p) => p.y),
    [stopPositions]
  )
  const glideLength = useCallback(
    (from: number, to: number) => {
      const section = sectionRef.current
      const stage = stageRef.current
      if (!section || !stage) return 900
      const unit = (section.offsetHeight - stage.clientHeight) / total // px per span unit
      return Math.min(
        2000,
        Math.max(800, 700 + (Math.abs(to - from) / unit) * 650)
      )
    },
    [total]
  )
  useKeyframeSnap(sectionRef, keyframes, !reduced, glideLength)

  // Deep links: /spaces/work-desk#the-wave-lamp opens on that product's act
  useEffect(() => {
    if (reduced) return
    const open = () => {
      const handle = decodeURIComponent(window.location.hash.slice(1))
      if (!handle) return
      // The act that frames the product, else the moment its light comes on
      let index = acts.findIndex(
        (a) => a.layout === "focus" && a.products.includes(handle)
      )
      let last = false
      if (index < 0) {
        index = acts.findIndex((a) => a.light?.reveal?.at.includes(handle))
        last = true
      }
      if (index < 0) return
      const stops = stopPositions().filter((p) => p.act === index)
      const stop = last ? stops[stops.length - 1] : stops[0]
      if (stop) window.scrollTo(0, stop.y)
    }
    open()
    window.addEventListener("hashchange", open)
    return () => window.removeEventListener("hashchange", open)
  }, [acts, reduced, stopPositions])

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const camera = cameraRef.current
    const turn = turnRef.current
    if (!section || !stage || !camera || !turn) return

    let frame = 0
    let visible = true
    const box = (handle: string) =>
      objects.find((o) => o.handle === handle)!.box

    const render = () => {
      frame = 0
      const vw = stage.clientWidth
      const vh = stage.clientHeight
      const layerW = vh * aspect

      // Scroll position, in acts (pos) and within the current act (within).
      // Reduced motion shows the finished space.
      let pos = acts.length - 1
      let current = acts.length - 1
      let within = 1
      let moving = 0
      if (!reduced) {
        const travel = section.offsetHeight - vh
        const scrolled = clamp(
          (-section.getBoundingClientRect().top + NAV_OFFSET) /
            Math.max(travel, 1)
        )
        let cursor = scrolled * total
        pos = 0
        for (let n = 0; n < acts.length; n++) {
          const { span, hold = HOLD } = acts[n]
          if (cursor <= span || n === acts.length - 1) {
            current = n
            within = clamp(cursor / span)
            moving =
              n === acts.length - 1
                ? 0
                : ease(clamp((within - hold) / (1 - hold)))
            pos = n + moving
            break
          }
          cursor -= span
        }
      }

      const a = acts[current]
      const b = acts[Math.min(current + 1, acts.length - 1)]
      const t = pos - current

      // Camera: interpolate the framed point and the zoom (in log space so
      // pushing in and pulling back feel equally paced), then keep the
      // photograph covering the stage wherever it is larger than it.
      const ca = cameraFor(a, aspect, vw, vh)
      const cb = cameraFor(b, aspect, vw, vh)
      const scale = Math.exp(mix(Math.log(ca.scale), Math.log(cb.scale), t))
      const fx = mix(ca.cx, cb.cx, t)
      const fy = mix(ca.cy, cb.cy, t)
      const w = layerW * scale
      const h = vh * scale
      let tx = mix(ca.ax, cb.ax, t) * vw - fx * w
      let ty = mix(ca.ay, cb.ay, t) * vh - fy * h
      tx = w >= vw ? clamp(tx, vw - w, 0) : (vw - w) / 2
      ty = h >= vh ? clamp(ty, vh - h, 0) : (vh - h) / 2
      camera.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`

      // Turn: the camera's attitude, eased between acts. Perspective on the
      // stage makes a few degrees read as the camera rotating in the room; a
      // slight overscale keeps the photograph's edges out of view.
      const yaw = mix(a.turn?.yaw ?? 0, b.turn?.yaw ?? 0, t)
      const pitch = mix(a.turn?.pitch ?? 0, b.turn?.pitch ?? 0, t)
      const roll = mix(a.turn?.roll ?? 0, b.turn?.roll ?? 0, t)
      const over =
        1 + 0.018 * (Math.abs(yaw) + Math.abs(pitch)) + 0.035 * Math.abs(roll)
      turn.style.transform =
        yaw || pitch || roll
          ? `perspective(${Math.round(
              vw * 1.4
            )}px) rotateY(${yaw}deg) rotateX(${pitch}deg) rotateZ(${roll}deg) scale(${over})`
          : ""

      // Light: inside an act it runs on the act's own clock while the camera
      // holds; between acts the end plate cross-fades into the next scene.
      let layers = lightFor(space, a, moving > 0 ? 1 : within)
      const from = endPlate(a)
      if (moving > 0 && b.scene !== from) {
        layers = [
          { plate: from, opacity: 1 },
          { plate: b.scene, opacity: t },
        ]
      }
      const order = layers.map((l) => l.plate)
      for (const key of Object.keys(space.plates)) {
        const el = plates.current[key]
        if (!el) continue
        const n = order.lastIndexOf(key)
        const layer = layers[n]
        el.style.opacity = n < 0 ? "0" : String(layer.opacity)
        el.style.zIndex = String(n + 1)
        const mask = n < 0 ? "none" : layer.mask ?? "none"
        el.style.maskImage = mask
        el.style.webkitMaskImage = mask
      }

      // Rack focus: a blurred copy of the visible plate covers everything
      // except the framed objects. The mask lives in the plate's coordinates,
      // so it travels with the camera for free.
      const focus = mix(
        a.layout === "focus" ? 1 : 0,
        b.layout === "focus" ? 1 : 0,
        t
      )
      const fb = {
        x: mix(a.frame.x, b.frame.x, t),
        y: mix(a.frame.y, b.frame.y, t),
        w: mix(a.frame.w, b.frame.w, t),
        h: mix(a.frame.h, b.frame.h, t),
      }
      const focusMask = `radial-gradient(ellipse ${fb.w * 62}% ${
        fb.h * 66
      }% at ${(fb.x + fb.w / 2) * 100}% ${
        (fb.y + fb.h / 2) * 100
      }%, transparent 70%, #000 100%)`
      const top = [...layers]
        .reverse()
        .find((l) => l.opacity >= 0.5 && (!l.mask || l.mask === "none"))?.plate
      for (const key of Object.keys(blurs.current)) {
        const el = blurs.current[key]
        if (!el) continue
        el.style.opacity = key === top ? String(focus) : "0"
        el.style.maskImage = focusMask
        el.style.webkitMaskImage = focusMask
      }

      // Hotspots follow the camera in screen space, so their type stays sharp.
      const settled = acts[Math.round(pos)]?.layout === "end"
      for (const o of objects) {
        const el = hotspots.current[o.handle]
        if (!el) continue
        const c = centre(o.box)
        el.style.transform = `translate3d(${tx + c.x * w}px, ${
          ty + c.y * h
        }px, 0)`
        el.style.opacity = settled ? "1" : "0"
        el.tabIndex = settled ? 0 : -1
      }

      // A hairline from the framed objects to their label, desktop only.
      const line = leaderRef.current
      if (line) {
        const show = focus > 0.98 && vw / vh >= 1.15
        line.style.opacity = show ? "1" : "0"
        if (show) {
          // From the right-most featured product, so it never crosses the others
          const lead = (a.products.length ? a : b).products
            .map(box)
            .reduce((best, x) => (x.x + x.w > best.x + best.w ? x : best))
          const panelLeft = vw - vw * 0.06 - Math.min(480, vw * 0.32)
          line.setAttribute("x1", String(tx + (lead.x + lead.w) * w + 12))
          line.setAttribute("y1", String(ty + (lead.y + lead.h * 0.3) * h))
          line.setAttribute("x2", String(panelLeft - 24))
          line.setAttribute("y2", String(vh * 0.5 - 60))
        }
      }

      // Copy on a dark plate waits until the light has actually changed: the
      // fade, or the reveal's fill when there is no fade.
      let index = Math.round(pos)
      const change = acts[index]?.light
      const gate = change?.fade
        ? [change.fade.from, change.fade.until]
        : change?.reveal && acts[index].tone === "dark"
          ? change.reveal.fill
          : null
      if (index === current && gate && moving === 0 && clamp((within - gate[0]) / (gate[1] - gate[0])) < 0.6) {
        index = -1
      }
      if (index !== activeRef.current) {
        activeRef.current = index
        setActive(index)
      }
    }

    const request = () => {
      if (visible && !frame) frame = requestAnimationFrame(render)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      request()
    })
    observer.observe(section)
    window.addEventListener("scroll", request, { passive: true })
    window.addEventListener("resize", request)
    request()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("scroll", request)
      window.removeEventListener("resize", request)
    }
  }, [reduced, space, acts, objects, aspect, total])

  const dark = acts[active]?.tone === "dark"
  const plateKeys = Object.keys(space.plates)
  const first = acts[0].scene

  return (
    <section
      ref={sectionRef}
      aria-label={space.alt}
      className="relative bg-paper"
      style={{ height: reduced ? "auto" : `calc(${total} * 100svh)` }}
    >
      <div
        ref={stageRef}
        className={`${
          reduced ? "relative h-[70svh]" : "sticky"
        } overflow-hidden bg-paper`}
        style={
          reduced
            ? undefined
            : { top: NAV_OFFSET, height: `calc(100svh - ${NAV_OFFSET}px)` }
        }
      >
        <div ref={turnRef} className="absolute inset-0 will-change-transform">
          <div
            ref={cameraRef}
            className="absolute left-0 top-0 origin-top-left will-change-transform"
            style={{
              height: "100%",
              aspectRatio: `${space.plate.width} / ${space.plate.height}`,
            }}
          >
            {plateKeys.map((key) => (
              <div
                key={key}
                ref={(el) => {
                  plates.current[key] = el
                }}
                className="absolute inset-0"
                style={{ opacity: key === first ? 1 : 0 }}
                aria-hidden={key !== first}
              >
                <Image
                  src={space.plates[key].src}
                  alt={key === first ? space.alt : ""}
                  fill
                  priority={key === first}
                  quality={82}
                  // The plate is about 5 screens wide on a phone before any
                  // zoom (1.3 on desktop), so ask for the largest variant there
                  sizes="(max-width: 768px) 600vw, 300vw"
                  placeholder={key === first && placeholder ? "blur" : "empty"}
                  blurDataURL={key === first ? placeholder : undefined}
                  className="object-cover"
                />
              </div>
            ))}
            {plateKeys
              .filter((key) => space.plates[key].blur)
              .map((key) => (
                <div
                  key={`${key}-blur`}
                  ref={(el) => {
                    blurs.current[key] = el
                  }}
                  className="absolute inset-0 z-50 opacity-0"
                  aria-hidden
                >
                  <Image
                    src={space.plates[key].blur!}
                    alt=""
                    fill
                    quality={60}
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              ))}
          </div>
        </div>

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          <line
            ref={leaderRef}
            stroke={dark ? "rgb(255 255 255 / 0.7)" : "rgb(20 20 20 / 0.55)"}
            strokeWidth="1"
            className="opacity-0 transition-opacity duration-300"
          />
        </svg>

        {objects.map((o) => {
          const product = products[o.handle]
          return (
            <LocalizedClientLink
              key={o.handle}
              href={`/products/${o.handle}`}
              ref={(el: HTMLAnchorElement | null) => {
                hotspots.current[o.handle] = el
              }}
              tabIndex={-1}
              aria-label={`${product?.title ?? o.name}${
                product?.price ? `, ${product.price}` : ""
              }`}
              className="group absolute left-0 top-0 -ml-[22px] -mt-[22px] flex h-11 w-11 items-center justify-center opacity-0 transition-opacity duration-500"
            >
              <span className="h-3 w-3 rounded-full bg-white shadow-[0_1px_6px_rgb(0_0_0/0.35)] ring-4 ring-white/30 transition-transform duration-200 group-hover:scale-125 group-focus-visible:scale-125" />
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-soft bg-surface px-3 py-1.5 text-xs text-ink opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                {product?.title ?? o.name}
                {product?.price && (
                  <span className="ml-2 tabular-nums text-muted">
                    {product.price}
                  </span>
                )}
              </span>
            </LocalizedClientLink>
          )
        })}

        {back && (
          <LocalizedClientLink
            href={back.href}
            className={`absolute left-4 top-4 z-10 inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-medium backdrop-blur transition-colors duration-500 small:left-8 small:top-6 ${
              dark
                ? "bg-ink/40 text-white hover:bg-ink/60"
                : "bg-paper/70 text-ink hover:bg-paper/90"
            }`}
          >
            <span aria-hidden>←</span> {back.label}
          </LocalizedClientLink>
        )}

        <ActCopy
          acts={acts}
          activeIndex={active}
          products={products}
          reduced={reduced}
        />
      </div>

      {reduced && (
        <ol className="content-container grid gap-10 py-12 small:grid-cols-2">
          {acts.map((a) => (
            <li key={a.id}>
              <h2 className="font-serif text-3xl text-ink">{a.title}</h2>
              <p className="mt-2 max-w-md text-muted">{a.body}</p>
              <ProductList
                handles={a.products}
                products={products}
                tone="light"
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function ActCopy({
  acts,
  activeIndex,
  products,
  reduced,
}: {
  acts: Act[]
  activeIndex: number
  products: Record<string, SpaceProduct>
  reduced: boolean
}) {
  if (reduced) return null
  const current = acts[activeIndex]
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* A soft wash behind the desktop label, so it never sits on a busy wall */}
      <div
        aria-hidden
        className={`absolute inset-y-0 right-0 hidden w-[50vw] transition-opacity duration-500 small:block ${
          current?.tone === "dark"
            ? "bg-gradient-to-l from-ink/60 via-ink/30 to-transparent"
            : "bg-gradient-to-l from-paper/85 via-paper/55 to-transparent"
        } ${current?.layout === "focus" ? "opacity-100" : "opacity-0"}`}
      />
      {acts.map((a, index) => {
        const shown = index === activeIndex
        const dark = a.tone === "dark"
        const focus = a.layout === "focus"
        const right = a.align === "end"
        const place = {
          hero: right
            ? "left-6 right-[6%] top-[9%] items-end text-right small:left-auto small:max-w-2xl"
            : "inset-x-0 top-[9%] px-6 text-center items-center",
          end: "inset-x-0 bottom-[9%] px-6 text-center items-center",
          focus:
            "inset-x-3 bottom-3 rounded-large bg-surface/95 p-5 backdrop-blur small:inset-x-auto small:bottom-auto small:right-[6%] small:top-1/2 small:w-[min(30rem,32vw)] small:-translate-y-1/2 small:bg-transparent small:p-0 small:backdrop-blur-0",
          caption: right
            ? "left-[6%] right-[6%] top-[10%] items-end text-right small:left-auto small:max-w-xl"
            : "left-[6%] right-[6%] bottom-[12%] max-w-xl",
        }[a.layout]
        const heading =
          dark && !focus
            ? "text-white"
            : dark
            ? "text-ink small:text-white"
            : "text-ink"
        const copy =
          dark && !focus
            ? "text-white/80"
            : dark
            ? "text-muted small:text-white/80"
            : "text-muted"
        return (
          <div
            key={a.id}
            aria-hidden={!shown}
            className={`absolute flex flex-col gap-3 transition-[opacity,transform] duration-500 ease-out ${place} ${
              shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{ pointerEvents: shown ? "auto" : "none" }}
          >
            {a.layout === "hero" ? (
              <h1
                className={`font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.01em] ${heading}`}
              >
                {a.title}
              </h1>
            ) : (
              <h2
                className={`font-serif text-[clamp(2rem,3.6vw,3.5rem)] leading-[1.02] ${heading}`}
              >
                {a.title}
              </h2>
            )}
            <p
              className={`max-w-[min(28rem,100%)] text-base leading-relaxed ${copy} ${
                a.layout === "hero" && !right ? "mx-auto" : ""
              }`}
            >
              {a.body}
            </p>
            {focus && (
              <ProductList
                handles={a.products}
                products={products}
                tone={dark ? "dark" : "light"}
              />
            )}
            {a.layout === "end" && (
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <a
                  href="#shop-the-room"
                  className={
                    dark
                      ? "btn-primary bg-white text-ink hover:bg-white/85"
                      : "btn-primary"
                  }
                >
                  Shop the room
                </a>
                <LocalizedClientLink
                  href="/store"
                  className={
                    dark
                      ? "btn-secondary border-white text-white hover:bg-white hover:text-ink"
                      : "btn-secondary"
                  }
                >
                  Browse everything
                </LocalizedClientLink>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ProductList({
  handles,
  products,
  tone,
}: {
  handles: string[]
  products: Record<string, SpaceProduct>
  tone: "light" | "dark"
}) {
  if (!handles.length) return null
  const ink = tone === "dark" ? "text-ink small:text-white" : "text-ink"
  const muted =
    tone === "dark" ? "text-muted small:text-white/70" : "text-muted"
  const rule =
    tone === "dark" ? "border-line small:border-white/25" : "border-line"
  return (
    <ul className={`mt-2 border-t ${rule}`}>
      {handles.map((handle) => {
        const p = products[handle]
        if (!p) return null
        return (
          <li
            key={handle}
            className={`flex items-center justify-between gap-4 border-b py-3 ${rule}`}
          >
            <LocalizedClientLink
              href={`/products/${handle}`}
              className={`min-w-0 text-sm font-medium underline-offset-4 hover:underline ${ink}`}
            >
              {p.title}
              {p.price && (
                <span className={`ml-2 font-normal tabular-nums ${muted}`}>
                  {p.price}
                </span>
              )}
            </LocalizedClientLink>
            <QuickAdd handle={handle} variantId={p.variantId} tone={tone} />
          </li>
        )
      })}
    </ul>
  )
}
