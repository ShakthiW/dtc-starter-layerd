type AccountPageHeaderProps = {
  title: string
  description?: string
  action?: React.ReactNode
}

const AccountPageHeader = ({
  title,
  description,
  action,
}: AccountPageHeaderProps) => (
  <header className="mb-8 flex flex-col gap-4 small:flex-row small:items-end small:justify-between">
    <div className="flex flex-col gap-2">
      <h1 className="font-serif leading-[1.05] text-4xl">
        {title}
      </h1>
      {description && <p className="max-w-xl text-muted">{description}</p>}
    </div>
    {action}
  </header>
)

export default AccountPageHeader
