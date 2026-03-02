import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/blog')({
  component: BlogLayout,
})

function BlogLayout() {
  return (
    <div className="page-wrap px-4 py-16">
      <nav className="mb-4 border-b border-border pb-4">
        <Link
          to="/blog"
          className="mr-4 rounded px-2 py-1 text-sm font-medium hover:bg-accent"
        >
          All Posts
        </Link>
        <Link
          to="/blog/popular"
          className="mr-4 rounded px-2 py-1 text-sm font-medium hover:bg-accent"
        >
          Popular
        </Link>
      </nav>

      <Outlet />
    </div>
  )
}
