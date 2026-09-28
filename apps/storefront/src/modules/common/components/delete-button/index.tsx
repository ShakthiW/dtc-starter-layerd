import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
}: {
  id: string
  children?: React.ReactNode
  className?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteLineItem(id).catch((_err) => {
      setIsDeleting(false)
    })
  }

  return (
    <button
      type="button"
      className={clx(
        "flex min-h-[40px] items-center gap-x-1.5 text-sm text-muted transition-colors hover:text-ink disabled:opacity-50",
        className
      )}
      onClick={() => handleDelete(id)}
      disabled={isDeleting}
      aria-label={children ? undefined : "Remove item"}
    >
      {isDeleting ? (
        <Spinner className="animate-spin" aria-hidden="true" />
      ) : (
        <Trash aria-hidden="true" />
      )}
      {children && <span>{isDeleting ? "Removing..." : children}</span>}
    </button>
  )
}

export default DeleteButton
