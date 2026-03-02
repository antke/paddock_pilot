import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'

export const Route = createFileRoute('/convex-test')({
  component: ConvexTestPage,
})

function ConvexTestPage() {
  const todos = useQuery(api.todos.list)
  const addTodo = useMutation(api.todos.add)
  const toggleTodo = useMutation(api.todos.toggle)
  const removeTodo = useMutation(api.todos.remove)

  const [newTodoText, setNewTodoText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoText.trim()) return

    setIsLoading(true)
    try {
      await addTodo({ text: newTodoText.trim() })
      setNewTodoText('')
    } catch (error) {
      console.error('Failed to add todo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTodo = async (id: string) => {
    try {
      await toggleTodo({ id: id as any })
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const handleRemoveTodo = async (id: string) => {
    try {
      await removeTodo({ id: id as any })
    } catch (error) {
      console.error('Failed to remove todo:', error)
    }
  }

  return (
    <main className="page-wrap px-4 py-16">
      <section className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sea-ink-soft)]">
            Convex Testing
          </p>
          <h1 className="m-0 text-4xl font-extrabold text-[var(--sea-ink)] sm:text-5xl">
            Convex Form Test
          </h1>
          <p className="m-0 text-base leading-relaxed text-[var(--sea-ink-soft)]">
            Test your Convex backend with this interactive todo manager.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            Add New Todo
          </h2>
          <form onSubmit={handleAddTodo} className="flex gap-2">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Enter todo text..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newTodoText.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            Todos ({todos?.length ?? 0})
          </h2>

          {todos === undefined ? (
            <p className="text-sm text-muted-foreground">Loading todos...</p>
          ) : todos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No todos yet. Add one above!
            </p>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo._id}
                  className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo._id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      todo.completed
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => handleRemoveTodo(todo._id)}
                    className="rounded-md bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground transition-colors hover:opacity-90"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            How it works:
          </h3>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                useQuery(api.todos.list)
              </code>{' '}
              - Fetches all todos from Convex
            </li>
            <li>
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                useMutation(api.todos.add)
              </code>{' '}
              - Creates a new todo
            </li>
            <li>
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                useMutation(api.todos.toggle)
              </code>{' '}
              - Toggles todo completion
            </li>
            <li>
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                useMutation(api.todos.remove)
              </code>{' '}
              - Deletes a todo
            </li>
          </ul>
        </div>
      </section>
    </main>
  )
}
