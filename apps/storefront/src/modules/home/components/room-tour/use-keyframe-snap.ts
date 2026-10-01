"use client"

import { RefObject, useEffect } from "react"

const IDLE_MS = 140 // a pause this long ends a free scroll gesture
const NUDGE_PX = 6 // smaller than this snaps back instead of moving on
const MOMENTUM_MS = 700 // trackpad inertia after a glide is swallowed this long

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * Frame locks for the room tour. Inside the tour, a small scroll in either
 * direction plays the scene all the way to the next keyframe and holds there.
 * Input is held while the glide runs (and through a trackpad's leftover
 * momentum just after it), so one flick moves exactly one keyframe. Dragging
 * the scrollbar still works: the page settles on a keyframe when it stops.
 *
 * `keyframes` returns document scroll positions, ascending. Outside the range
 * they cover the page scrolls normally. Off entirely under reduced motion.
 */
export function useKeyframeSnap(
  sectionRef: RefObject<HTMLElement | null>,
  keyframes: () => number[],
  enabled: boolean,
  /** Glide length in ms for a given distance, so long moves aren't rushed. */
  duration: (from: number, to: number) => number
) {
  useEffect(() => {
    if (!enabled || !sectionRef.current) return

    let anchor = window.scrollY // where the current free gesture started
    let idle = 0
    let glide = 0
    let gliding = false
    let cooldownUntil = 0
    let lastWheel = 0
    let lastWheelAt = 0
    let touching = false

    const inRange = (y: number, k: number[]) => y >= k[0] - 2 && y <= k[k.length - 1] + 2

    const target = (y: number, direction: number, k: number[]) => {
      if (direction > 0) return k.find((p) => p > y + 1) ?? k[k.length - 1]
      if (direction < 0) return [...k].reverse().find((p) => p < y - 1) ?? k[0]
      return k.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a))
    }

    const glideTo = (to: number) => {
      const from = window.scrollY
      if (Math.abs(to - from) < 4) {
        // Already there: correct instantly rather than gliding a few pixels
        window.scrollTo(0, to)
        anchor = to
        return
      }
      const ms = duration(from, to)
      const start = performance.now()
      gliding = true
      const step = (now: number) => {
        const t = Math.min((now - start) / ms, 1)
        window.scrollTo(0, from + (to - from) * easeInOut(t))
        if (t < 1) {
          glide = requestAnimationFrame(step)
        } else {
          gliding = false
          anchor = to
          cooldownUntil = performance.now() + MOMENTUM_MS
        }
      }
      glide = requestAnimationFrame(step)
    }

    const settle = () => {
      idle = 0
      if (touching || gliding) return
      const k = keyframes()
      const y = window.scrollY
      if (!k.length || !inRange(y, k)) {
        anchor = y
        return
      }
      const moved = y - anchor
      glideTo(target(y, Math.abs(moved) < NUDGE_PX ? 0 : Math.sign(moved), k))
    }

    const onScroll = () => {
      if (gliding) return
      window.clearTimeout(idle)
      idle = window.setTimeout(settle, IDLE_MS)
    }

    const onWheel = (e: WheelEvent) => {
      const now = performance.now()
      const size = Math.abs(e.deltaY)
      const k = keyframes()
      const inside = k.length > 0 && inRange(window.scrollY, k)
      if (inside && gliding) {
        e.preventDefault()
      } else if (inside && now < cooldownUntil) {
        // Inertia decays; a fresh gesture arrives bigger or after a gap.
        const fresh = size > lastWheel * 1.4 + 4 || now - lastWheelAt > 90
        if (fresh) cooldownUntil = 0
        else e.preventDefault()
      }
      lastWheel = size
      lastWheelAt = now
    }

    const onTouchStart = () => {
      touching = true
      if (!gliding) anchor = window.scrollY
    }
    const onTouchEnd = () => {
      touching = false
      window.clearTimeout(idle)
      idle = window.setTimeout(settle, IDLE_MS)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (gliding) e.preventDefault()
    }

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return
      const down = ["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey
      const up = ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)
      if (!down && !up) return
      const k = keyframes()
      const y = window.scrollY
      if (!k.length || !inRange(y, k)) return
      if (down && y >= k[k.length - 1] - 1) return // leave the room normally
      if (up && y <= k[0] + 1) return
      e.preventDefault()
      if (gliding) return
      cancelAnimationFrame(glide)
      glideTo(target(y, down ? 1 : -1, k))
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("keydown", onKey)
    return () => {
      cancelAnimationFrame(glide)
      window.clearTimeout(idle)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("keydown", onKey)
    }
  }, [sectionRef, keyframes, enabled, duration])
}
