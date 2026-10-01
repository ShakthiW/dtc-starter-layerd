import { Space } from "../types"

const dir = "/spaces/work-desk"

/**
 * A work desk by the window, from morning to the late shift. Boxes found with
 * Gemini object detection on day.jpg and checked against an overlay; the
 * night plates are pixel-aligned edits of it.
 */
export const workDesk: Space = {
  slug: "work-desk",
  name: "Work desk",
  summary: "A tidy desk by the window, from the first coffee to the late shift.",
  alt: "A pale-oak work desk by a window, organised with LAYERD drawers, lamps and a cable winder",
  plate: { width: 4800, height: 2036 },
  plates: {
    day: { src: `${dir}/day.jpg`, blur: `${dir}/day-blur.jpg` },
    nightOff: { src: `${dir}/night-off.jpg` },
    nightLit: { src: `${dir}/night.jpg`, blur: `${dir}/night-blur.jpg` },
  },
  poster: "day",
  objects: [
    { handle: "minimalist-table-lamp-bionic", name: "Bionic table lamp", box: { x: 0.196, y: 0.337, w: 0.062, h: 0.303 } },
    { handle: "stackable-desktop-drawers-organiser", name: "Stackable desktop drawers", box: { x: 0.276, y: 0.449, w: 0.085, h: 0.189 } },
    { handle: "kumiko-design-desk-organiser", name: "Kumiko desk organiser", box: { x: 0.368, y: 0.489, w: 0.065, h: 0.145 } },
    { handle: "portable-cable-organizer", name: "Ergonomic cable winder", box: { x: 0.597, y: 0.52, w: 0.069, h: 0.127 } },
    { handle: "the-wave-lamp", name: "The Wave Lamp", box: { x: 0.688, y: 0.366, w: 0.095, h: 0.282 } },
    { handle: "modular-under-desk-drawers", name: "Under-desk drawers", box: { x: 0.618, y: 0.78, w: 0.218, h: 0.064 } },
  ],
  acts: [
    {
      id: "arrival",
      span: 1.1,
      stops: [0],
      layout: "hero",
      frame: { x: 0, y: 0, w: 1, h: 1 },
      fit: "cover",
      scene: "day",
      // Opens slightly turned, and squares up to the desk as you scroll in
      turn: { yaw: -5, roll: -0.6 },
      tone: "light",
      products: [],
      title: "Your best hours happen here.",
      body: "A desk that keeps itself tidy and stays lit for the late ones. Every piece printed layer by layer in Sri Lanka.",
    },
    {
      id: "order",
      span: 1.5,
      layout: "focus",
      frame: { x: 0.26, y: 0.42, w: 0.19, h: 0.25 },
      fit: "cover",
      scene: "day",
      turn: { yaw: 2.5 },
      tone: "light",
      products: ["stackable-desktop-drawers-organiser", "kumiko-design-desk-organiser"],
      title: "Everything in its place.",
      body: "Drawers for the small things, a lattice for the pens you actually use.",
    },
    {
      id: "under",
      span: 1.5,
      layout: "focus",
      frame: { x: 0.6, y: 0.72, w: 0.25, h: 0.16 },
      // Low in the plate: phones zoom onto one drawer so it clears the sheet
      phoneFrame: { x: 0.7, y: 0.78, w: 0.06, h: 0.05 },
      fit: "cover",
      scene: "day",
      // The camera tips down to look under the desktop
      turn: { pitch: 5 },
      tone: "light",
      products: ["modular-under-desk-drawers"],
      title: "Under the surface.",
      body: "Slim drawers that mount beneath the desk, so the top stays clear.",
    },
    {
      id: "cables",
      span: 1.4,
      layout: "focus",
      frame: { x: 0.58, y: 0.48, w: 0.11, h: 0.2 },
      fit: "cover",
      scene: "day",
      turn: { yaw: -3 },
      tone: "light",
      products: ["portable-cable-organizer"],
      title: "Cables, tamed.",
      body: "Wind a charger round it once and it stops wandering across the desk.",
    },
    {
      id: "late",
      span: 2.4,
      hold: 0.78,
      stops: [0.26, 0.74],
      layout: "caption",
      frame: { x: 0.12, y: 0.2, w: 0.76, h: 0.72 },
      fit: "cover",
      scene: "day",
      light: {
        fade: { to: "nightOff", from: 0, until: 0.22 },
        reveal: {
          plate: "nightLit",
          at: ["the-wave-lamp", "minimalist-table-lamp-bionic"],
          start: 0.28,
          step: 0.16,
          fill: [0.6, 0.72],
        },
      },
      tone: "dark",
      products: [],
      title: "Late, still going.",
      body: "Warm enough to work by, soft enough to stay. The light comes through every printed layer.",
    },
    {
      id: "desk",
      span: 1.3,
      stops: [0.2],
      layout: "end",
      frame: { x: 0, y: 0, w: 1, h: 1 },
      fit: "cover",
      scene: "nightLit",
      tone: "dark",
      products: [],
      title: "Your desk, sorted.",
      body: "Every piece on this desk is in the shop. Tap one to see it up close.",
    },
  ],
}
