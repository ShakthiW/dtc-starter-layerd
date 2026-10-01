import { Space } from "../types"

const dir = "/spaces/kitchen"

/**
 * A kitchen counter and window at sunrise. The low sun reaches each object in
 * turn, left to right. Boxes from Gemini detection on sun.jpg; dawn.jpg is a
 * pixel-aligned edit of it.
 */
export const kitchen: Space = {
  slug: "kitchen",
  name: "Kitchen & windowsill",
  summary: "A counter, a window and a wall of herbs, from blue dawn to first sun.",
  alt: "A kitchen counter under a window with LAYERD herb planters, a vase, a figure and a cable winder",
  plate: { width: 4800, height: 2036 },
  plates: {
    dawn: { src: `${dir}/dawn.jpg`, blur: `${dir}/dawn-blur.jpg` },
    sun: { src: `${dir}/sun.jpg`, blur: `${dir}/sun-blur.jpg` },
  },
  poster: "sun",
  objects: [
    { handle: "the-halo-vase", name: "The Halo Vase", box: { x: 0.199, y: 0.41, w: 0.067, h: 0.361 } },
    { handle: "the-kenso-planter", name: "The Kenso Planter", box: { x: 0.279, y: 0.146, w: 0.188, h: 0.453 } },
    { handle: "nobody-bloom", name: "Nobody, Bloom", box: { x: 0.528, y: 0.558, w: 0.052, h: 0.212 } },
    { handle: "portable-cable-organizer", name: "Ergonomic cable winder", box: { x: 0.73, y: 0.692, w: 0.084, h: 0.114 } },
  ],
  acts: [
    {
      id: "arrival",
      span: 1.1,
      stops: [0],
      layout: "hero",
      // The empty wall is at the upper right; the herbs fill the centre
      align: "end",
      frame: { x: 0, y: 0, w: 1, h: 1 },
      fit: "cover",
      scene: "dawn",
      turn: { yaw: -4 },
      tone: "light",
      products: [],
      title: "Mornings start here.",
      body: "A window, a counter and a wall that grows something you can cook with.",
    },
    {
      id: "herbs",
      span: 1.5,
      layout: "focus",
      frame: { x: 0.27, y: 0.13, w: 0.21, h: 0.48 },
      fit: "cover",
      scene: "dawn",
      // The camera tips up to the wall of herbs
      turn: { pitch: -3 },
      tone: "light",
      products: ["the-kenso-planter"],
      title: "Herbs on the wall.",
      body: "Hexagon planters that hang flat and fit together, basil to thyme.",
    },
    {
      id: "sunrise",
      span: 2.3,
      hold: 0.8,
      // Blue dawn, then one nudge brings the sun across every piece in turn
      stops: [0.08, 0.76],
      layout: "caption",
      align: "end",
      frame: { x: 0.1, y: 0.1, w: 0.8, h: 0.75 },
      fit: "cover",
      scene: "dawn",
      light: {
        reveal: {
          plate: "sun",
          at: ["the-halo-vase", "the-kenso-planter", "nobody-bloom", "portable-cable-organizer"],
          start: 0.12,
          step: 0.1,
          fill: [0.55, 0.72],
          radius: 20,
        },
      },
      tone: "light",
      products: [],
      title: "Then the sun comes round.",
      body: "Printed objects catch low light beautifully. Every layer throws its own small shadow.",
    },
    {
      id: "counter",
      span: 1.5,
      layout: "focus",
      frame: { x: 0.19, y: 0.38, w: 0.4, h: 0.42 },
      phoneFrame: { x: 0.19, y: 0.4, w: 0.09, h: 0.38 },
      fit: "cover",
      scene: "sun",
      turn: { yaw: 2 },
      tone: "light",
      products: ["the-halo-vase", "nobody-bloom"],
      title: "Something living, something still.",
      body: "A vase for whatever's in season and a figure that holds the last of the flowers.",
    },
    {
      id: "charge",
      span: 1.4,
      layout: "focus",
      frame: { x: 0.72, y: 0.66, w: 0.11, h: 0.16 },
      fit: "cover",
      scene: "sun",
      turn: { yaw: -2 },
      tone: "light",
      products: ["portable-cable-organizer"],
      title: "Charged and tidy.",
      body: "The phone charger stays wound by the coffee, not tangled in it.",
    },
    {
      id: "morning",
      span: 1.2,
      stops: [0.2],
      layout: "end",
      frame: { x: 0, y: 0, w: 1, h: 1 },
      fit: "cover",
      scene: "sun",
      tone: "light",
      products: [],
      title: "Good morning, then.",
      body: "Every piece in this kitchen is in the shop. Tap one to see it up close.",
    },
  ],
}
