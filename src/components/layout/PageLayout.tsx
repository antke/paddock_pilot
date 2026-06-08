type PageLayoutProps = {
  children: React.ReactNode
  width?: 'default' | 'wide'
}

export function PageLayout({ children, width = 'wide' }: PageLayoutProps) {
  const contentClass =
    width === 'wide'
      ? 'col-span-12'
      : 'col-span-12 md:col-span-8 md:col-start-3'

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-12">
        <div className={contentClass}>{children}</div>
      </div>
    </main>
  )
}
