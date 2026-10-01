/**
 * A space is one photographed room the visitor walks through by scrolling:
 * a set of pixel-aligned plates (the same frame in different light), the
 * products placed in it, and the acts the camera moves through.
 *
 * Coordinates are fractions of the plate (0 to 1 from the top-left).
 */

export type Box = { x: number; y: number; w: number; h: number }

export type SceneObject = {
  handle: string
  /** Fallback label before live product data arrives. */
  name: string
  box: Box
}

export type Plate = {
  src: string
  /** Pre-blurred copy for rack focus. Plates without one can't be focused on. */
  blur?: string
}

/** The camera's attitude, in degrees. Small values read as the camera turning. */
export type Turn = { yaw?: number; pitch?: number; roll?: number }

export type Light = {
  /** Cross-fade to another plate, between two points of the act (0 to 1). */
  fade?: { to: string; from: number; until: number }
  /**
   * Reveal a plate in pools around products, one after another (lamps coming
   * on, sun reaching objects), then across the whole frame.
   */
  reveal?: {
    plate: string
    at: string[]
    start: number
    step: number
    fill: [number, number]
    /** Pool size, as a percentage of the plate. Smaller for close-set objects. */
    radius?: number
  }
}

export type Act = {
  id: string
  /** Scroll length in viewport heights. The peak gets the most. */
  span: number
  /** Share of the act spent holding still before the camera moves on. */
  hold?: number
  /** Frame locks: where in the act (0 to 1) a nudge settles. Default: mid-hold. */
  stops?: number[]
  /**
   * hero: the opening headline. focus: a product label beside the framed
   * objects. caption: a line of copy low on the left. end: the closing call to
   * action, with every product as a hotspot.
   */
  layout: "hero" | "focus" | "caption" | "end"
  /**
   * Where hero and caption copy sits, to keep it on an empty part of the
   * photograph. hero: top centre (default) or top right. caption: bottom left
   * (default) or top right.
   */
  align?: "start" | "end"
  frame: Box
  /** A tighter frame for phones, where the label sheet takes the lower half. */
  phoneFrame?: Box
  /** contain: the whole frame fits. cover: the photograph always fills the screen. */
  fit: "contain" | "cover"
  /** Plate showing when the act begins. */
  scene: string
  light?: Light
  turn?: Turn
  /** Copy sits on a light or a dark part of the photograph. */
  tone: "light" | "dark"
  products: string[]
  title: string
  body: string
}

export type Space = {
  slug: string
  /** Card and page title, e.g. "Work desk". */
  name: string
  /** One line for the spaces index. */
  summary: string
  /** Describes the photograph for screen readers. */
  alt: string
  plate: { width: number; height: number }
  plates: Record<string, Plate>
  /** Plate used for the index card. */
  poster: string
  objects: SceneObject[]
  acts: Act[]
}
