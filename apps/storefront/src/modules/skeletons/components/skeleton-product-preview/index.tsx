const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-[4/5] w-full rounded-rounded bg-line/50" />
      <div className="mt-3 flex flex-col gap-2">
        <div className="h-4 w-3/4 rounded bg-line/50" />
        <div className="h-4 w-1/3 rounded bg-line/50" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
