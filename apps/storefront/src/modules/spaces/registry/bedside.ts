import { Space } from "../types"

const dir = "/spaces/bedside"

/**
 * A bedroom corner at the end of the day. The lamp comes on first, then night
 * falls around it. Boxes from Gemini detection on evening.jpg; night.jpg is a
 * pixel-aligned edit of it.
 */
export const bedside: Space = {
  slug: "bedside",
  name: "Bedside",
  summary: "A bedside table and a made bed, from golden hour to lights out.",
  alt: "A calm bedroom corner with a LAYERD lamp, vase and figure on the bedside table and a knitted bunny on the pillow",
  plate: { width: 4800, height: 2036 },
  plates: {
    evening: { src: `${dir}/evening.jpg`, blur: `${dir}/evening-blur.jpg` },
    night: { src: `${dir}/night.jpg`, blur: `${dir}/night-blur.jpg` },
  },
  poster: "evening",
  objects: [
    { handle: "minimalist-table-lamp-hexagon", name: "Hexagon table lamp", box: { x: 0.242, y: 0.558, w: 0.067, h: 0.306 } },
    { handle: "the-halo-vase", name: "The Halo Vase", box: { x: 0.315, y: 0.472, w: 0.068, h: 0.374 } },
    { handle: "nobody-bloom", name: "Nobody, Bloom", box: { x: 0.369, y: 0.665, w: 0.049, h: 0.204 } },
    { handle: "knitted-bunny-figurine-key-tag", name: "Knitted Bunny", box: { x: 0.608, y: 0.636, w: 0.047, h: 0.19 } },
    { handle: "knitted-polarbear-figurine-key-tag", name: "Knitted Polar Bear", box: { x: 0.921, y: 0.516, w: 0.038, h: 0.105 } },
  ],
  acts: [
    {
      id: "arrival",
      span: 1.1,
      stops: [0],
      layout: "hero",
      frame: { x: 0, y: 0, w: 1, h: 1 },
      fit: "cover",
      scene: "evening",
      turn: { yaw: 4, roll: 0.5 },
      tone: "light",
      products: [],
      title: "The last ten minutes of the day.",
      body: "A lamp to read by, a few things worth looking at, and somewhere soft to land.",
    },
    {
      id: "read",
      span: 1.5,
      layout: "focus",
      frame: { x: 0.23, y: 0.45, w: 0.17, h: 0.43 },
      fit: "cover",
      scene: "evening",
      turn: { yaw: -2 },
      tone: "light",
      products: ["minimalist-table-lamp-hexagon", "the-halo-vase"],
      title: "Something to read by.",
      body: "A faceted shade that softens the light, and one dried stem for company.",
    },
    {
      id: "company",
      span: 1.5,
      layout: "focus",
      frame: { x: 0.36, y: 0.6, w: 0.31, h: 0.3 },
      phoneFrame: { x: 0.6, y: 0.62, w: 0.07, h: 0.22 },
      fit: "cover",
      scene: "evening",
      turn: { yaw: 2, pitch: 2 },
      tone: "light",
      products: ["nobody-bloom", "knitted-bunny-figurine-key-tag"],
      title: "Soft company.",
      body: "A quiet figure on the table, a knitted bunny on the pillow.",
    },
    {
      id: "goodnight",
      span: 2.2,
      hold: 0.78,
      // The lamp comes on in the last of the daylight, then night falls round it
      stops: [0.3, 0.74],
      layout: "caption",
      frame: { x: 0.12, y: 0.25, w: 0.7, h: 0.7 },
      // Phones crop to the centre wall otherwise; keep the lamp in view
      phoneFrame: { x: 0.2, y: 0.42, w: 0.24, h: 0.5 },
      fit: "cover",
      scene: "evening",
      light: {
        reveal: { plate: "night", at: ["minimalist-table-lamp-hexagon"], start: 0.1, step: 0, fill: [0.42, 0.66], radius: 18 },
      },
      tone: "dark",
      products: [],
      title: "Goodnight.",
      body: "The light comes through every printed layer, warm and low, right where you need it.",
    },
    {
      id: "rest",
      span: 1.2,
      stops: [0.2],
      layout: "end",
      frame: { x: 0, y: 0, w: 1, h: 1 },
      fit: "cover",
      scene: "night",
      tone: "dark",
      products: [],
      title: "Sleep on it.",
      body: "Every piece by this bed is in the shop. Tap one to see it up close.",
    },
  ],
}
