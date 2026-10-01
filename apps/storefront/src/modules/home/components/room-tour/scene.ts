/**
 * The room tour's scene: where each product sits in the photograph, and what
 * each act of the scroll shows. Coordinates are fractions of the plate (0 to 1
 * from the top-left), measured on /public/room/day.jpg. The dusk plates are
 * pixel-aligned edits of the same frame, so one set of coordinates serves all.
 */

export const PLATE = { width: 4800, height: 2036 }

export type Box = { x: number; y: number; w: number; h: number }

export type SceneObject = {
  handle: string
  /** Shown before live product data arrives, and as the image's alt text. */
  name: string
  box: Box
}

export const OBJECTS: SceneObject[] = [
  { handle: "the-wave-lamp", name: "The Wave Lamp", box: { x: 0.17, y: 0.47, w: 0.054, h: 0.165 } },
  { handle: "kumiko-design-desk-organiser", name: "Kumiko desk organiser", box: { x: 0.094, y: 0.595, w: 0.051, h: 0.094 } },
  { handle: "minimalist-table-lamp-ribs", name: "Ribs table lamp", box: { x: 0.389, y: 0.515, w: 0.038, h: 0.169 } },
  { handle: "the-halo-vase", name: "The Halo Vase", box: { x: 0.442, y: 0.42, w: 0.035, h: 0.262 } },
  { handle: "nobody-bloom", name: "Nobody, Bloom", box: { x: 0.477, y: 0.525, w: 0.038, h: 0.162 } },
  { handle: "the-kenso-planter", name: "The Kenso Planter", box: { x: 0.557, y: 0.25, w: 0.121, h: 0.303 } },
  { handle: "knitted-polarbear-figurine-key-tag", name: "Knitted Polar Bear", box: { x: 0.807, y: 0.607, w: 0.053, h: 0.136 } },
  { handle: "knitted-fox-knitted-figurine-key-tag", name: "Knitted Fox", box: { x: 0.852, y: 0.636, w: 0.043, h: 0.124 } },
]

/** Lamps that switch on during the dusk act, in order. */
export const LAMPS = ["the-wave-lamp", "minimalist-table-lamp-ribs"] as const

export type ActId = "arrival" | "desk" | "living" | "dusk" | "gifts" | "room"

export type Act = {
  id: ActId
  /** Scroll length in viewport heights. The peak (dusk) gets the most. */
  span: number
  /** Share of the act spent holding still before the camera moves on. */
  hold?: number
  /**
   * Frame locks: where in the act (0 to 1) a nudge of the scroll settles.
   * Defaults to the middle of the hold.
   */
  stops?: number[]
  /** The part of the plate the camera frames. */
  frame: Box
  /** A tighter frame for phones, where the label sheet takes the lower half. */
  phoneFrame?: Box
  /**
   * contain: the whole frame fits, with paper around the photograph if the
   * screen is narrower than the plate. cover: the photograph always fills the
   * screen.
   */
  fit: "contain" | "cover"
  /** Rack focus: everything outside `frame` is thrown out of focus. */
  focus: boolean
  /** 0 = afternoon, 1 = dusk with every lamp on. */
  night: number
  /** Copy sits on a light (day) or dark (dusk) part of the room. */
  tone: "light" | "dark"
  products: string[]
  title: string
  body: string
}

export const ACTS: Act[] = [
  {
    id: "arrival",
    span: 1.1,
    stops: [0],
    frame: { x: 0, y: 0, w: 1, h: 1 },
    fit: "cover",
    focus: false,
    night: 0,
    tone: "light",
    products: [],
    title: "Shape your space.",
    body: "Objects for the desk, the shelf and the windowsill. Designed and 3D printed in Sri Lanka, layer by layer.",
  },
  {
    id: "desk",
    span: 1.5,
    frame: { x: 0.08, y: 0.44, w: 0.16, h: 0.27 },
    fit: "cover",
    focus: true,
    night: 0,
    tone: "light",
    products: ["the-wave-lamp", "kumiko-design-desk-organiser"],
    title: "A calmer desk.",
    body: "One lamp for the evenings, one organiser for everything else.",
  },
  {
    id: "living",
    span: 1.5,
    frame: { x: 0.375, y: 0.24, w: 0.31, h: 0.47 },
    phoneFrame: { x: 0.38, y: 0.4, w: 0.15, h: 0.3 },
    fit: "cover",
    focus: true,
    night: 0,
    tone: "light",
    products: ["minimalist-table-lamp-ribs", "the-halo-vase", "nobody-bloom", "the-kenso-planter"],
    title: "A shelf with a point of view.",
    body: "Ribbed light, a black vessel, a quiet figure and a wall that grows.",
  },
  {
    id: "dusk",
    span: 2.4,
    hold: 0.78,
    // The room goes dark, then one nudge plays the lamps coming on in turn
    stops: [0.26, 0.74],
    frame: { x: 0.06, y: 0.12, w: 0.66, h: 0.78 },
    fit: "cover",
    focus: false,
    night: 1,
    tone: "dark",
    products: [],
    title: "Then the light goes.",
    body: "Every LAYERD lamp is printed in fine layers, so the light comes through the lines.",
  },
  {
    id: "gifts",
    span: 1.4,
    frame: { x: 0.795, y: 0.58, w: 0.11, h: 0.2 },
    fit: "cover",
    focus: true,
    night: 1,
    tone: "dark",
    products: ["knitted-polarbear-figurine-key-tag", "knitted-fox-knitted-figurine-key-tag"],
    title: "Small things, soft edges.",
    body: "Knitted Friends, as a figurine or a key tag.",
  },
  {
    id: "room",
    span: 1.3,
    stops: [0.2],
    frame: { x: 0, y: 0, w: 1, h: 1 },
    fit: "cover",
    focus: false,
    night: 1,
    tone: "dark",
    products: [],
    title: "Your space, finished.",
    body: "Every piece in this room is in the shop. Tap one to see it up close.",
  },
]
