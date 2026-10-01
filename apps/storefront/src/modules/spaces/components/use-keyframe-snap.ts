"use client"

import { RefObject, useEffect } from "react"

const IDLE_MS = 140 // a pause this long means free scrolling has stopped
const NUDGE_PX = 6 // smaller than this snaps back instead of moving on
const GESTURE_GAP_MS = 90 // wheel events closer than this belong to one flick
const SWIPE_PX = 10 // finger travel that starts a glide on touch
const STEADY_EVENTS = 8 // this many even-sized wheel events in a row = scrolling, not a flick
const SECOND_FLICK_MS = 250 // a new push this long after a glide starts = in a hurry

// Moves from the first frame (no slow ramp that reads as lag), lands softly
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Frame locks for the room tour.
 *
 * A nudge (one wheel tick, one flick, one short swipe) starts a glide to the
 * next keyframe at once, and the rest of that gesture, a trackpad's momentum
 * included, is absorbed: one flick moves exactly one keyframe.
 *
 * Someone in a hurry keeps scrolling: a steady stream of wheel input, a second
 * flick while the glide runs, or a new swipe mid-glide. Then the lock lets go,
 * the page scrolls natively and the scene plays as it passes, and once the
 * scrolling stops it settles on the next keyframe in that direction. The
 * scrollbar behaves the same way.
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

    let anchor = window.scrollY // where the current gesture started
    let idle = 0
    let glide = 0
    let gliding = false
    let glideTarget = 0
    let glideDirection = 0
    let glideStartedAt = 0
    let free = false // in a hurry: native scrolling drives the scene
    let lastWheel = 0
    let lastWheelAt = 0
    let steady = 0
    let wheelUsed = false // the current wheel gesture already started a glide
    let touching = false
    let touchY = 0
    let touchUsed = false // the current swipe already started a glide

    const inRange = (y: number, k: number[]) => y >= k[0] - 2 && y <= k[k.length - 1] + 2

    // Whether moving this way stays inside the tour. Down from the last
    // keyframe (the shop below) and up from the first scroll normally.
    const takes = (y: number, direction: number, k: number[]) =>
      k.length > 0 &&
      inRange(y, k) &&
      !(direction > 0 && y >= k[k.length - 1] - 1) &&
      !(direction < 0 && y <= k[0] + 1)

    const target = (y: number, direction: number, k: number[]) => {
      if (direction > 0) return k.find((p) => p > y + 1) ?? k[k.length - 1]
      if (direction < 0) return [...k].reverse().find((p) => p < y - 1) ?? k[0]
      return k.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a))
    }

    const stopGlide = () => {
      cancelAnimationFrame(glide)
      gliding = false
    }

    const glideTo = (to: number) => {
      stopGlide()
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
      glideTarget = to
      glideDirection = Math.sign(to - from)
      glideStartedAt = start
      const step = (now: number) => {
        const t = Math.min((now - start) / ms, 1)
        window.scrollTo(0, from + (to - from) * easeOut(t))
        if (t < 1) {
          glide = requestAnimationFrame(step)
        } else {
          gliding = false
          anchor = to
        }
      }
      glide = requestAnimationFrame(step)
    }

    /** Let go: the page scrolls natively until the visitor stops. */
    const goFree = () => {
      stopGlide()
      free = true
    }

    const settle = () => {
      idle = 0
      if (touching || gliding) return
      free = false
      wheelUsed = false
      const k = keyframes()
      const y = window.scrollY
      if (!k.length || !inRange(y, k)) {
        anchor = y
        return
      }
      // Already resting on a keyframe (a deep link, a restored position): stay
      const exact = k.find((p) => Math.abs(p - y) < 2)
      if (exact !== undefined) {
        anchor = exact
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
      const gap = now - lastWheelAt
      const rising = gap <= GESTURE_GAP_MS && size > lastWheel * 1.4 + 4
      // Even-sized input in a stream (a spun mouse wheel, a dragging
      // trackpad), unlike a flick that rises and then decays
      steady =
        gap <= GESTURE_GAP_MS && size > 4 && size >= lastWheel * 0.85 && size <= lastWheel * 1.15
          ? steady + 1
          : 0
      lastWheel = size
      lastWheelAt = now

      const direction = Math.sign(e.deltaY)
      const k = keyframes()
      const y = window.scrollY
      if (!direction || !k.length || !inRange(y, k)) return
      if (free) return // in a hurry: the scene follows the scroll

      if (gliding) {
        const again =
          direction === glideDirection &&
          (gap > GESTURE_GAP_MS || (rising && now - glideStartedAt > SECOND_FLICK_MS))
        if (again || steady >= STEADY_EVENTS) {
          goFree()
          return
        }
        e.preventDefault()
        return
      }

      // A new gesture after the glide has finished
      if (gap > GESTURE_GAP_MS || rising) wheelUsed = false
      if (wheelUsed) {
        if (steady >= STEADY_EVENTS) {
          goFree()
          return
        }
        e.preventDefault() // the tail of a flick that already moved a keyframe
        return
      }
      if (!takes(y, direction, k)) return
      e.preventDefault()
      wheelUsed = true
      anchor = y
      glideTo(target(y, direction, k))
    }

    const onTouchStart = (e: TouchEvent) => {
      touching = true
      touchUsed = false
      touchY = e.touches[0]?.clientY ?? 0
      if (gliding) {
        // A new swipe before the last glide finished: they're in a hurry
        goFree()
        return
      }
      if (!free) anchor = window.scrollY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (free) return
      if (touchUsed) {
        if (e.cancelable) e.preventDefault()
        return
      }
      const dy = touchY - (e.touches[0]?.clientY ?? touchY) // > 0: finger up, page down
      const direction = Math.sign(dy)
      const k = keyframes()
      const y = window.scrollY
      if (!direction || !takes(y, direction, k)) return
      // Hold the page still from the first pixel, then glide once it's a swipe
      if (e.cancelable) e.preventDefault()
      if (Math.abs(dy) >= SWIPE_PX) {
        touchUsed = true
        anchor = y
        glideTo(target(y, direction, k))
      }
    }
    const onTouchEnd = () => {
      touching = false
      if (touchUsed && !free) return
      window.clearTimeout(idle)
      idle = window.setTimeout(settle, IDLE_MS)
    }

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return
      const down = ["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey
      const up = ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)
      if (!down && !up) return
      const direction = down ? 1 : -1
      const k = keyframes()
      // Pressing again mid-glide carries on to the following keyframe
      const from = gliding && direction === glideDirection ? glideTarget : window.scrollY
      if (!takes(from, direction, k)) return
      e.preventDefault()
      free = false
      glideTo(target(from, direction, k))
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
