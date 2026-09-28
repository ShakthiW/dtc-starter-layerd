"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import Image from "next/image"
import { useRef, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  title: string
}

/**
 * Desktop: one large image with a thumbnail strip to switch it.
 * Mobile: a swipeable, scroll-snapping strip with a position counter.
 */
const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [active, setActive] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)

  const withUrl = images.filter((image) => image.url)

  if (!withUrl.length) {
    return <div className="aspect-[4/5] w-full rounded-large bg-surface" />
  }

  const current = withUrl[Math.min(active, withUrl.length - 1)]
  const altFor = (index: number) =>
    `${title}, image ${index + 1} of ${withUrl.length}`

  const onStripScroll = () => {
    const strip = stripRef.current
    if (strip) {
      setMobileIndex(Math.round(strip.scrollLeft / strip.clientWidth))
    }
  }

  return (
    <div>
      {/* Mobile: swipe through every image */}
      <div className="relative small:hidden">
        <div
          ref={stripRef}
          onScroll={onStripScroll}
          className="-mx-4 flex snap-x snap-mandatory overflow-x-auto no-scrollbar"
          aria-label={`${title} images`}
          role="region"
        >
          {withUrl.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-[4/5] w-full shrink-0 snap-center bg-surface"
            >
              <Image
                src={image.url!}
                alt={altFor(index)}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {withUrl.length > 1 && (
          <span className="absolute bottom-3 right-0 rounded-full bg-paper/90 px-3 py-1 text-xs tabular-nums text-ink">
            {mobileIndex + 1} / {withUrl.length}
          </span>
        )}
      </div>

      {/* Desktop: large image + thumbnails */}
      <div className="hidden small:flex small:flex-col small:gap-4">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-large bg-surface">
          <Image
            key={current.id}
            src={current.url!}
            alt={altFor(active)}
            fill
            priority
            sizes="(max-width: 1280px) 55vw, 700px"
            className="object-cover"
          />
        </div>
        {withUrl.length > 1 && (
          <ul className="grid grid-cols-6 gap-3">
            {withUrl.map((image, index) => (
              <li key={image.id}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Show image ${index + 1} of ${withUrl.length}`}
                  aria-current={index === active ? "true" : undefined}
                  className={clx(
                    "relative block aspect-square w-full overflow-hidden rounded-rounded bg-surface ring-offset-2 ring-offset-paper transition",
                    index === active
                      ? "ring-2 ring-ink"
                      : "opacity-70 hover:opacity-100"
                  )}
                >
                  <Image
                    src={image.url!}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
