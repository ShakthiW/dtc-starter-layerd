import { Container, clx } from "@modules/common/components/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string }[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  /** Show the product's second image on hover (product grids only). */
  showHoverImage?: boolean
  alt?: string
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  showHoverImage,
  alt = "",
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url
  const hoverImage = showHoverImage
    ? images?.find((image) => image.url && image.url !== initialImage)?.url
    : undefined

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden bg-surface rounded-rounded",
        className,
        {
          "aspect-[4/5]": isFeatured || size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} size={size} alt={alt} />
      {hoverImage && (
        <Image
          src={hoverImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 object-cover object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          draggable={false}
          sizes="(max-width: 768px) 50vw, 25vw"
          fill
        />
      )}
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
  alt,
}: Pick<ThumbnailProps, "size"> & { image?: string; alt: string }) => {
  return image ? (
    <Image
      src={image}
      alt={alt}
      className="absolute inset-0 object-cover object-center"
      draggable={false}
      quality={50}
      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
      fill
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
