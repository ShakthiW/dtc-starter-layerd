import { MetadataRoute } from "next"

import { getBaseURL } from "@lib/util/env"

// Cloudflare adds its content signals in front of these rules
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Per-visitor pages with nothing to index
      disallow: ["/*/cart", "/*/checkout", "/*/account", "/*/order"],
    },
    sitemap: `${getBaseURL()}/sitemap.xml`,
  }
}
