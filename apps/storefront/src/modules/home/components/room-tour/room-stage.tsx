"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import QuickAdd from "./quick-add"
import { ACTS, Box, LAMPS, OBJECTS, PLATE } from "./scene"
import { useKeyframeSnap } from "./use-keyframe-snap"

export type RoomProduct = {
  handle: string
  title: string
  price: string | null
  /** Set only when the product has a single variant, so it can be added here. */
  variantId: string | null
}

type Props = {
  products: Record<string, RoomProduct>
  placeholders: { day: string; dusk: string }
}

const ASPECT = PLATE.width / PLATE.height
const NAV_OFFSET = 96 // announcement bar + header, both sticky above the stage
const HOLD = 0.42 // share of each act spent settled before moving on
const TOTAL = ACTS.reduce((sum, act) => sum + act.span, 0)

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const centre = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 })
const objectBox = (handle: string) => OBJECTS.find((o) => o.handle === handle)!.box

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  query.addEventListener("change", callback)
  return () => query.removeEventListener("change", callback)
}
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Where the camera sits for one act, for the current stage size. */
function cameraFor(act: (typeof ACTS)[number], vw: number, vh: number) {
  const layerW = vh * ASPECT
  const wide = vw / vh >= 1.15
  const contain = Math.min(vw / layerW, 1)
  const cover = Math.max(vw / layerW, 1)
  // Desktop frames the object on the left and keeps the right for the label;
  // phones frame it in the upper half above the bottom sheet.
  const room = act.focus
    ? wide
      ? { w: vw * 0.5, h: vh * 0.66, ax: 0.34, ay: 0.5 }
      : { w: vw * 0.86, h: vh * 0.42, ax: 0.5, ay: 0.33 }
    : { w: vw, h: vh, ax: 0.5, ay: 0.5 }
  const frame = !wide && act.phoneFrame ? act.phoneFrame : act.frame
  let scale = Math.min(room.w / (frame.w * layerW), room.h / (frame.h * vh))
  // On phones the photograph is already as tall as the screen, so a focus act
  // zooms further to have room to lift the object above the label sheet.
  const floor = act.fit === "contain" && wide ? contain : act.focus && !wide ? cover * 1.7 : cover
  scale = Math.max(scale, floor)
  const c = centre(frame)
  return { scale, cx: c.x, cy: c.y, ax: room.ax, ay: room.ay }
}

export default function RoomStage({ products, placeholders }: Props) {
  const reduced = useSyncExternalStore(subscribeMotion, getReducedMotion, () => false)
  const [active, setActive] = useState(0)

  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const layers = useRef<Record<string, HTMLDivElement | null>>({})
  const hotspots = useRef<Record<string, HTMLAnchorElement | null>>({})
  const leaderRef = useRef<SVGLineElement>(null)
  const activeRef = useRef(0)

  // Frame locks: document scroll positions of every keyframe in the tour,
  // plus the hand-off to the shop grid below it.
  const keyframes = useCallback(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return []
    const top = section.getBoundingClientRect().top + window.scrollY
    const travel = section.offsetHeight - stage.clientHeight
    const points: number[] = []
    let cursor = 0
    for (const act of ACTS) {
      for (const stop of act.stops ?? [(act.hold ?? HOLD) / 2]) {
        points.push(top - NAV_OFFSET + ((cursor + stop * act.span) / TOTAL) * travel)
      }
      cursor += act.span
    }
    points.push(top + section.offsetHeight - NAV_OFFSET)
    return points
  }, [])
  const glideLength = useCallback((from: number, to: number) => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return 900
    const unit = (section.offsetHeight - stage.clientHeight) / TOTAL // px per span unit
    return Math.min(2000, Math.max(800, 700 + (Math.abs(to - from) / unit) * 650))
  }, [])
  useKeyframeSnap(sectionRef, keyframes, !reduced, glideLength)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const camera = cameraRef.current
    if (!section || !stage || !camera) return

    let frame = 0
    let visible = true

    const render = () => {
      frame = 0
      const vw = stage.clientWidth
      const vh = stage.clientHeight
      const layerW = vh * ASPECT

      // Scroll position, in acts (pos) and within the current act (within).
      // Reduced motion shows the finished room.
      let pos = ACTS.length - 1
      let current = ACTS.length - 1
      let within = 1
      if (!reduced) {
        const travel = section.offsetHeight - vh
        const scrolled = clamp((-section.getBoundingClientRect().top + NAV_OFFSET) / Math.max(travel, 1))
        let cursor = scrolled * TOTAL
        pos = 0
        for (let n = 0; n < ACTS.length; n++) {
          const { span, hold = HOLD } = ACTS[n]
          if (cursor <= span || n === ACTS.length - 1) {
            current = n
            within = clamp(cursor / span)
            const moving = clamp((within - hold) / (1 - hold))
            pos = n + (n === ACTS.length - 1 ? 0 : ease(moving))
            break
          }
          cursor -= span
        }
      }

      const i = Math.min(Math.floor(pos), ACTS.length - 1)
      const t = pos - i
      const a = ACTS[i]
      const b = ACTS[Math.min(i + 1, ACTS.length - 1)]

      // Camera: interpolate the framed point and the zoom (in log space so
      // pushing in and pulling back feel equally paced), then keep the
      // photograph covering the stage wherever it is larger than it.
      const ca = cameraFor(a, vw, vh)
      const cb = cameraFor(b, vw, vh)
      const scale = Math.exp(mix(Math.log(ca.scale), Math.log(cb.scale), t))
      const fx = mix(ca.cx, cb.cx, t)
      const fy = mix(ca.cy, cb.cy, t)
      const ax = mix(ca.ax, cb.ax, t)
      const ay = mix(ca.ay, cb.ay, t)
      const w = layerW * scale
      const h = vh * scale
      let tx = ax * vw - fx * w
      let ty = ay * vh - fy * h
      tx = w >= vw ? clamp(tx, vw - w, 0) : (vw - w) / 2
      ty = h >= vh ? clamp(ty, vh - h, 0) : (vh - h) / 2
      camera.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`

      // Light runs on its own clock inside the dusk act, while the camera
      // holds: afternoon falls to blue hour, the lamps come on one by one,
      // then their warm spill fills the room.
      const duskIndex = ACTS.findIndex((x) => x.id === "dusk")
      const dusk = current < duskIndex ? 0 : current > duskIndex ? 1 : within
      const fall = clamp(dusk / 0.22)
      const lampOn = LAMPS.map((_, n) => clamp((dusk - 0.28 - n * 0.16) / 0.1))
      const spill = clamp((dusk - 0.6) / 0.12)
      const set = (key: string, opacity: number, mask?: string) => {
        const el = layers.current[key]
        if (!el) return
        el.style.opacity = String(opacity)
        if (mask !== undefined) {
          el.style.maskImage = mask
          el.style.webkitMaskImage = mask
        }
      }
      set("duskOff", fall)
      const lampMasks = LAMPS.map((handle, n) => {
        const c = centre(objectBox(handle))
        const r = lampOn[n] * 26
        return `radial-gradient(circle at ${c.x * 100}% ${c.y * 100}%, #000 ${r * 0.55}%, transparent ${Math.max(r, 0.01)}%)`
      })
      const lit = Math.max(spill, 0)
      set(
        "duskLit",
        Math.max(...lampOn) > 0 ? 1 : 0,
        lit >= 1 ? "none" : [...lampMasks, `linear-gradient(rgba(0,0,0,${lit}), rgba(0,0,0,${lit}))`].join(", ")
      )

      // Rack focus: the blurred copy covers everything except the framed
      // object. The mask lives in the plate's coordinates, so it travels with
      // the camera for free.
      const focus = mix(a.focus ? 1 : 0, b.focus ? 1 : 0, t)
      const fb = {
        x: mix(a.frame.x, b.frame.x, t),
        y: mix(a.frame.y, b.frame.y, t),
        w: mix(a.frame.w, b.frame.w, t),
        h: mix(a.frame.h, b.frame.h, t),
      }
      const focusMask = `radial-gradient(ellipse ${fb.w * 62}% ${fb.h * 66}% at ${(fb.x + fb.w / 2) * 100}% ${(fb.y + fb.h / 2) * 100}%, transparent 70%, #000 100%)`
      set("dayBlur", focus * (1 - fall), focusMask)
      set("duskBlur", focus * lit, focusMask)

      // Hotspots follow the camera in screen space, so their type stays sharp.
      const settled = pos >= ACTS.length - 1.02
      for (const o of OBJECTS) {
        const el = hotspots.current[o.handle]
        if (!el) continue
        const c = centre(o.box)
        el.style.transform = `translate3d(${tx + c.x * w}px, ${ty + c.y * h}px, 0)`
        el.style.opacity = settled ? "1" : "0"
        el.tabIndex = settled ? 0 : -1
      }

      // A hairline from the framed object to its label, desktop only.
      const line = leaderRef.current
      if (line) {
        const show = focus > 0.98 && vw / vh >= 1.15
        line.style.opacity = show ? "1" : "0"
        if (show) {
          // From the right-most featured product, so it never crosses the others
          const lead = (a.products.length ? a : b).products
            .map(objectBox)
            .reduce((best, box) => (box.x + box.w > best.x + best.w ? box : best))
          const panelLeft = vw - vw * 0.06 - Math.min(480, vw * 0.32)
          line.setAttribute("x1", String(tx + (lead.x + lead.w) * w + 12))
          line.setAttribute("y1", String(ty + (lead.y + lead.h * 0.3) * h))
          line.setAttribute("x2", String(panelLeft - 24))
          line.setAttribute("y2", String(vh * 0.5 - 60))
        }
      }

      // Dusk copy is white, so it waits until the room has actually gone dark.
      let index = Math.round(pos)
      if (ACTS[index]?.id === "dusk" && fall < 0.6) index = -1
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
  }, [reduced])

  const dark = ACTS[active]?.tone === "dark"

  return (
    <section
      ref={sectionRef}
      aria-label="A room furnished with LAYERD objects"
      className="relative bg-paper"
      style={{ height: reduced ? "auto" : `calc(${TOTAL} * 100svh)` }}
    >
      <div
        ref={stageRef}
        className={`${reduced ? "relative h-[70svh]" : "sticky"} overflow-hidden bg-paper`}
        style={reduced ? undefined : { top: NAV_OFFSET, height: `calc(100svh - ${NAV_OFFSET}px)` }}
      >
        <div
          ref={cameraRef}
          className="absolute left-0 top-0 origin-top-left will-change-transform"
          style={{ height: "100%", aspectRatio: `${PLATE.width} / ${PLATE.height}` }}
        >
          <Image
            src="/room/day.jpg"
            alt="A light, calm living room and study furnished with LAYERD lamps, vases, planters and figurines"
            fill
            priority
            quality={82}
            sizes="(max-width: 768px) 260vw, 300vw"
            placeholder="blur"
            blurDataURL={placeholders.day}
            className="object-cover"
          />
          {(
            [
              ["dayBlur", "/room/day-blur.jpg"],
              ["duskOff", "/room/dusk-off.jpg"],
              ["duskLit", "/room/dusk.jpg"],
              ["duskBlur", "/room/dusk-blur.jpg"],
            ] as const
          ).map(([key, src]) => (
            <div
              key={key}
              ref={(el) => {
                layers.current[key] = el
              }}
              className="absolute inset-0 opacity-0"
              aria-hidden
            >
              <Image
                src={src}
                alt=""
                fill
                quality={key.endsWith("Blur") ? 60 : 82}
                sizes={key.endsWith("Blur") ? "100vw" : "(max-width: 768px) 260vw, 300vw"}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <line
            ref={leaderRef}
            stroke={dark ? "rgb(255 255 255 / 0.7)" : "rgb(20 20 20 / 0.55)"}
            strokeWidth="1"
            className="opacity-0 transition-opacity duration-300"
          />
        </svg>

        {OBJECTS.map((o) => {
          const product = products[o.handle]
          return (
            <LocalizedClientLink
              key={o.handle}
              href={`/products/${o.handle}`}
              ref={(el: HTMLAnchorElement | null) => {
                hotspots.current[o.handle] = el
              }}
              tabIndex={-1}
              aria-label={`${product?.title ?? o.name}${product?.price ? `, ${product.price}` : ""}`}
              className="group absolute left-0 top-0 -ml-[22px] -mt-[22px] flex h-11 w-11 items-center justify-center opacity-0 transition-opacity duration-500"
            >
              <span className="h-3 w-3 rounded-full bg-white shadow-[0_1px_6px_rgb(0_0_0/0.35)] ring-4 ring-white/30 transition-transform duration-200 group-hover:scale-125 group-focus-visible:scale-125" />
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-soft bg-surface px-3 py-1.5 text-xs text-ink opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                {product?.title ?? o.name}
                {product?.price && <span className="ml-2 tabular-nums text-muted">{product.price}</span>}
              </span>
            </LocalizedClientLink>
          )
        })}

        <ActCopy activeIndex={active} products={products} reduced={reduced} />
      </div>

      {reduced && (
        <ol className="content-container grid gap-10 py-12 small:grid-cols-2">
          {ACTS.map((a) => (
            <li key={a.id}>
              <h2 className="font-serif text-3xl text-ink">{a.title}</h2>
              <p className="mt-2 max-w-md text-muted">{a.body}</p>
              <ProductList handles={a.products} products={products} tone="light" />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function ActCopy({
  activeIndex,
  products,
  reduced,
}: {
  activeIndex: number
  products: Record<string, RoomProduct>
  reduced: boolean
}) {
  if (reduced) return null
  const current = ACTS[activeIndex]
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* A soft wash behind the desktop label, so it never sits on a busy wall */}
      <div
        aria-hidden
        className={`absolute inset-y-0 right-0 hidden w-[50vw] transition-opacity duration-500 small:block ${
          current?.tone === "dark"
            ? "bg-gradient-to-l from-ink/60 via-ink/30 to-transparent"
            : "bg-gradient-to-l from-paper/85 via-paper/55 to-transparent"
        } ${current?.focus ? "opacity-100" : "opacity-0"}`}
      />
      {ACTS.map((a, index) => {
        const shown = index === activeIndex
        const dark = a.tone === "dark"
        const hero = a.id === "arrival"
        const end = a.id === "room"
        const place = hero
          ? "inset-x-0 top-[9%] px-6 text-center items-center"
          : end
            ? "inset-x-0 bottom-[9%] px-6 text-center items-center"
            : a.focus
              ? "inset-x-3 bottom-3 rounded-large bg-surface/95 p-5 backdrop-blur small:inset-x-auto small:bottom-auto small:right-[6%] small:top-1/2 small:w-[min(30rem,32vw)] small:-translate-y-1/2 small:bg-transparent small:p-0 small:backdrop-blur-0"
              : "left-[6%] bottom-[12%] max-w-xl"
        return (
          <div
            key={a.id}
            aria-hidden={!shown}
            className={`absolute flex flex-col gap-3 transition-[opacity,transform] duration-500 ease-out ${place} ${
              shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{ pointerEvents: shown ? "auto" : "none" }}
          >
            {hero ? (
              <h1 className="font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.01em] text-ink">
                {a.title}
              </h1>
            ) : (
              <h2
                className={`font-serif text-[clamp(2rem,3.6vw,3.5rem)] leading-[1.02] ${
                  dark && !a.focus ? "text-white" : dark ? "text-ink small:text-white" : "text-ink"
                }`}
              >
                {a.title}
              </h2>
            )}
            <p
              className={`max-w-md text-base leading-relaxed ${
                dark && !a.focus ? "text-white/80" : dark ? "text-muted small:text-white/80" : "text-muted"
              } ${hero ? "mx-auto" : ""}`}
            >
              {a.body}
            </p>
            {a.focus && <ProductList handles={a.products} products={products} tone={dark ? "dark" : "light"} />}
            {end && (
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <a href="#shop-the-room" className="btn-primary bg-white text-ink hover:bg-white/85">
                  Shop the room
                </a>
                <LocalizedClientLink href="/store" className="btn-secondary border-white text-white hover:bg-white hover:text-ink">
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
  products: Record<string, RoomProduct>
  tone: "light" | "dark"
}) {
  if (!handles.length) return null
  const ink = tone === "dark" ? "text-ink small:text-white" : "text-ink"
  const muted = tone === "dark" ? "text-muted small:text-white/70" : "text-muted"
  const rule = tone === "dark" ? "border-line small:border-white/25" : "border-line"
  return (
    <ul className={`mt-2 border-t ${rule}`}>
      {handles.map((handle) => {
        const p = products[handle]
        if (!p) return null
        return (
          <li key={handle} className={`flex items-center justify-between gap-4 border-b py-3 ${rule}`}>
            <LocalizedClientLink href={`/products/${handle}`} className={`min-w-0 text-sm font-medium underline-offset-4 hover:underline ${ink}`}>
              {p.title}
              {p.price && <span className={`ml-2 font-normal tabular-nums ${muted}`}>{p.price}</span>}
            </LocalizedClientLink>
            <QuickAdd handle={handle} variantId={p.variantId} tone={tone} />
          </li>
        )
      })}
    </ul>
  )
}
