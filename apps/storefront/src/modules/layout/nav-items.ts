/** Top-level shop navigation, shared by the desktop header and mobile menu. */
export const NAV_ITEMS = [
  { label: "Shop all", href: "/store" },
  { label: "Spaces", href: "/spaces" },
  { label: "Lighting", href: "/categories/lighting" },
  { label: "Desk & Workspace", href: "/categories/desk-workspace" },
  { label: "Vases & Planters", href: "/categories/vases-planters" },
  { label: "Gifts", href: "/categories/gifts" },
  { label: "Print your model", href: "/#custom" },
]

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/bylayerd" },
  { label: "TikTok", href: "https://www.tiktok.com/@bylayerd" },
]

/** Where customers send their own 3D models for a printing quote. */
export const STUDIO_EMAIL = "prints.layerd@gmail.com"

const CUSTOM_PRINT_BODY = [
  "Hi LAYERD,",
  "",
  "I'd like a quote to print my 3D model (file attached).",
  "",
  "Size:",
  "Colour:",
  "Quantity:",
  "Needed by:",
  "Mobile number:",
  "Anything else:",
].join("\n")

/** A pre-filled email for a custom print request. */
export const CUSTOM_PRINT_MAILTO = `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(
  "3D print quote request"
)}&body=${encodeURIComponent(CUSTOM_PRINT_BODY)}`
