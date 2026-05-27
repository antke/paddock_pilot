type PageLayoutProps = {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-12">
        <div className="col-span-12 md:col-span-8 md:col-start-3">
          {children}
        </div>
      </div>
    </main>
  )
}
