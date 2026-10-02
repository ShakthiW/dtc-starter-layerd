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
import { Act, Box, SceneObject, Space } from "../types"
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

type Rect = { left: number; top: number; right: number; bottom: number }

/** Some of an act's products, padded, as one box on the plate. */
function focusBox(act: Act, objects: SceneObject[], handles = act.products): Box {
  const boxes = handles
    .map((handle) => objects.find((o) => o.handle === handle)?.box)
    .filter((b): b is Box => Boolean(b))
  if (!boxes.length) return act.frame
  const x0 = Math.min(...boxes.map((b) => b.x))
  const y0 = Math.min(...boxes.map((b) => b.y))
  const x1 = Math.max(...boxes.map((b) => b.x + b.w))
  const y1 = Math.max(...boxes.map((b) => b.y + b.h))
  const padX = (x1 - x0) * 0.12 + 0.01
  const padY = (y1 - y0) * 0.1 + 0.012
  const left = Math.max(0, x0 - padX)
  const top = Math.max(0, y0 - padY)
  return { x: left, y: top, w: Math.min(1, x1 + padX) - left, h: Math.min(1, y1 + padY) - top }
}

/**
 * Where the camera sits for one act, for the current stage size.
 *
 * Product acts fit their products into the stage's free area: whatever the
 * act's label doesn't cover (a panel at the side on large screens, a sheet at
 * the bottom on small ones). The label is measured, not assumed, so this
 * holds at every window size. Other acts frame their set region.
 */
function cameraFor(
  act: Act,
  plate: { width: number; height: number },
  objects: SceneObject[],
  vw: number,
  vh: number,
  label?: Rect
) {
  const layerW = (vh * plate.width) / plate.height
  const cover = Math.max(vw / layerW, 1)
  const wide = vw / vh >= 1.15

  if (act.layout !== "focus") {
    const frame = !wide && act.phoneFrame ? act.phoneFrame : act.frame
    const fit = Math.min(vw / (frame.w * layerW), vh / (frame.h * vh))
    const floor = act.fit === "contain" && wide ? Math.min(vw / layerW, 1) : cover
    const c = centre(frame)
    return {
      scale: Math.max(fit, floor),
      cx: c.x,
      cy: c.y,
      ax: 0.5,
      ay: 0.5,
      box: frame,
      framed: [] as string[],
      floor: vh,
    }
  }

  // The free area: the stage minus the label and a margin
  const safe = { left: vw * 0.05, top: vh * 0.1, right: vw * 0.95, bottom: vh * 0.92 }
  // The photograph may end just behind an opaque bottom sheet: nothing shows
  // below the sheet's top edge, so products low in the photo can still be
  // lifted into view without zooming in further
  let floor = vh
  if (label) {
    if (label.left > vw * 0.4) safe.right = Math.min(safe.right, label.left - 32)
    else if (label.top > vh * 0.25) {
      safe.bottom = Math.min(safe.bottom, label.top - 16)
      floor = label.top + 24
    }
  }
  const fitOf = (b: Box) =>
    Math.min((safe.right - safe.left) / (b.w * layerW), (safe.bottom - safe.top) / (b.h * vh))
  // Frame the lead product, then any others that still fit without zooming
  // out past the photograph (far-apart products can't all fit on a narrow
  // screen; the label still lists every one)
  let framed = act.products.slice(0, 1)
  for (const handle of act.products.slice(1)) {
    const trial = [...framed, handle]
    if (fitOf(focusBox(act, objects, trial)) >= cover) framed = trial
  }
  const box = focusBox(act, objects, framed)
  const fit = fitOf(box)
  // Products near a plate edge need extra zoom before the camera can bring
  // them into the free area without showing past the photograph's edge
  const reach = Math.max(
    box.y > 0 ? safe.top / (box.y * vh) : 0,
    box.y + box.h < 1 ? (floor - safe.bottom) / ((1 - box.y - box.h) * vh) : 0,
    box.x > 0 ? safe.left / (box.x * layerW) : 0,
    box.x + box.w < 1 ? (vw - safe.right) / ((1 - box.x - box.w) * layerW) : 0
  )
  let scale = Math.max(cover, fit)
  if (reach > scale) scale = Math.min(reach, scale * 1.6)
  // No closer than the photograph stays sharp (about 1.25 screen px per plate px)
  scale = Math.min(scale, Math.max(cover, (plate.width / layerW) * 1.25))
  const c = centre(box)
  return {
    scale,
    cx: c.x,
    cy: c.y,
    ax: (safe.left + safe.right) / 2 / vw,
    ay: (safe.top + safe.bottom) / 2 / vh,
    box,
    framed,
    floor,
  }
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
  // Each act's label (panel or sheet), measured against the stage
  const copies = useRef<(HTMLDivElement | null)[]>([])
  const labels = useRef<(Rect | undefined)[]>([])

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
      const ca = cameraFor(a, space.plate, objects, vw, vh, labels.current[current])
      const cb = cameraFor(
        b,
        space.plate,
        objects,
        vw,
        vh,
        labels.current[Math.min(current + 1, acts.length - 1)]
      )
      const scale = Math.exp(mix(Math.log(ca.scale), Math.log(cb.scale), t))
      const fx = mix(ca.cx, cb.cx, t)
      const fy = mix(ca.cy, cb.cy, t)
      const w = layerW * scale
      const h = vh * scale
      let tx = mix(ca.ax, cb.ax, t) * vw - fx * w
      let ty = mix(ca.ay, cb.ay, t) * vh - fy * h
      tx = w >= vw ? clamp(tx, vw - w, 0) : (vw - w) / 2
      const floor = mix(ca.floor, cb.floor, t)
      ty = h >= floor ? clamp(ty, floor - h, 0) : (floor - h) / 2
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
      const sa = ca.box
      const sb = cb.box
      const fb = {
        x: mix(sa.x, sb.x, t),
        y: mix(sa.y, sb.y, t),
        w: mix(sa.w, sb.w, t),
        h: mix(sa.h, sb.h, t),
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

      // A hairline from the framed objects to their side panel
      const line = leaderRef.current
      if (line) {
        // Only beside a side panel (as measured), never over a bottom sheet
        const label = labels.current[current]
        const framed = (a.layout === "focus" ? ca : cb).framed
        const show = focus > 0.98 && !!label && label.left > vw * 0.4 && framed.length > 0
        line.style.opacity = show ? "1" : "0"
        if (show) {
          // From the right-most framed product, so it never crosses the others
          const lead = framed
            .map(box)
            .reduce((best, x) => (x.x + x.w > best.x + best.w ? x : best))
          line.setAttribute("x1", String(tx + (lead.x + lead.w) * w + 12))
          line.setAttribute("y1", String(ty + (lead.y + lead.h * 0.3) * h))
          line.setAttribute("x2", String(label.left - 24))
          line.setAttribute("y2", String(label.top + 32))
        }
      }

      // Which products are in shot, for tests and debugging
      const inShot = moving > 0 ? "" : ca.framed.join(",")
      if (stage.dataset.framed !== inShot) stage.dataset.framed = inShot

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

    // Labels move with the breakpoint and wrap with the copy, so re-measure
    // whenever the stage or any label changes size, and once fonts load
    const measure = () => {
      const box = stage.getBoundingClientRect()
      labels.current = copies.current.map((el) => {
        if (!el) return undefined
        const r = el.getBoundingClientRect()
        return {
          left: r.left - box.left,
          top: r.top - box.top,
          right: r.right - box.left,
          bottom: r.bottom - box.top,
        }
      })
      request()
    }
    const sizes = new ResizeObserver(measure)
    sizes.observe(stage)
    copies.current.forEach((el) => el && sizes.observe(el))
    document.fonts?.ready.then(measure)
    measure()
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
      sizes.disconnect()
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
              data-box={`${o.box.x},${o.box.y},${o.box.w},${o.box.h}`}
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
          copyRef={(index, el) => {
            copies.current[index] = el
          }}
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
  copyRef,
}: {
  acts: Act[]
  activeIndex: number
  products: Record<string, SpaceProduct>
  reduced: boolean
  copyRef: (index: number, el: HTMLDivElement | null) => void
}) {
  if (reduced) return null
  const current = acts[activeIndex]
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* A soft wash behind the desktop label, so it never sits on a busy wall */}
      <div
        aria-hidden
        className={`absolute inset-y-0 right-0 hidden w-[50vw] transition-opacity duration-500 panel:block ${
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
            "inset-x-0 bottom-0 max-h-[70%] overflow-y-auto rounded-t-large bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] panel:max-h-[calc(100%-2rem)] panel:rounded-none panel:inset-x-auto panel:bottom-auto panel:right-[6%] panel:top-1/2 panel:w-[min(30rem,32vw)] panel:-translate-y-1/2 panel:bg-transparent panel:p-0 panel:backdrop-blur-0",
          caption: right
            ? "left-[6%] right-[6%] top-[10%] items-end text-right small:left-auto small:max-w-xl"
            : "left-[6%] right-[6%] bottom-[12%] max-w-xl",
        }[a.layout]
        const heading =
          dark && !focus
            ? "text-white"
            : dark
            ? "text-ink panel:text-white"
            : "text-ink"
        const copy =
          dark && !focus
            ? "text-white/80"
            : dark
            ? "text-muted panel:text-white/80"
            : "text-muted"
        return (
          <div
            key={a.id}
            ref={(el) => copyRef(index, el)}
            data-act={a.id}
            data-layout={a.layout}
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
  const ink = tone === "dark" ? "text-ink panel:text-white" : "text-ink"
  const muted =
    tone === "dark" ? "text-muted panel:text-white/70" : "text-muted"
  const rule =
    tone === "dark" ? "border-line panel:border-white/25" : "border-line"
  return (
    <ul className={`mt-2 border-t ${rule}`}>
      {handles.map((handle) => {
        const p = products[handle]
        if (!p) return null
        return (
          <li
            key={handle}
            className={`flex items-center justify-between gap-4 border-b py-1.5 panel:py-3 ${rule}`}
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
