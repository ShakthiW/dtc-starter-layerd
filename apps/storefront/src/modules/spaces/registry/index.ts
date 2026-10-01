import { Space } from "../types"
import { livingRoom } from "./living-room"
import { bedside } from "./bedside"
import { kidsShelf } from "./kids-shelf"
import { kitchen } from "./kitchen"
import { workDesk } from "./work-desk"

/** Every space, in the order the index and previous/next links use. */
export const SPACES: Space[] = [livingRoom, workDesk, bedside, kitchen, kidsShelf]

export const getSpace = (slug: string) => SPACES.find((s) => s.slug === slug)

/** The spaces a product appears in, for "Seen in" on product pages. */
export const spacesWith = (handle: string) => SPACES.filter((s) => s.objects.some((o) => o.handle === handle))

export const neighbours = (slug: string) => {
  const i = SPACES.findIndex((s) => s.slug === slug)
  return {
    previous: i > 0 ? SPACES[i - 1] : null,
    next: i >= 0 && i < SPACES.length - 1 ? SPACES[i + 1] : null,
  }
}
