import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll } from 'vitest'
import { ConvexProvider } from 'convex/react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
if (!CONVEX_URL) {
  throw new Error('VITE_CONVEX_URL is not set')
}

const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConvexProvider client={convexQueryClient.convexClient}>
    {children}
  </ConvexProvider>
)

describe('Convex Todos Integration', () => {
  beforeAll(async () => {
    // Wait for Convex to connect
    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  it('should connect to Convex', async () => {
    const { result } = renderHook(() => useQuery(api.todos.list), { wrapper })

    await waitFor(
      () => {
        expect(Array.isArray(result.current)).toBe(true)
      },
      { timeout: 5000 },
    )
  })

  it('should add a todo', async () => {
    const { result: todoList } = renderHook(() => useQuery(api.todos.list), {
      wrapper,
    })

    const { result: addTodo } = renderHook(() => useMutation(api.todos.add), {
      wrapper,
    })

    await waitFor(() => expect(Array.isArray(todoList.current)).toBe(true))

    const testText = `Test todo ${Date.now()}`
    await addTodo.current({ text: testText })

    await waitFor(
      () => {
        const todos = todoList.current as Array<{ text: string }>
        expect(todos.some((t) => t.text === testText)).toBe(true)
      },
      { timeout: 5000 },
    )
  })

  it('should toggle a todo', async () => {
    const { result: todoList } = renderHook(() => useQuery(api.todos.list), {
      wrapper,
    })

    const { result: addTodo } = renderHook(() => useMutation(api.todos.add), {
      wrapper,
    })

    const { result: toggleTodo } = renderHook(
      () => useMutation(api.todos.toggle),
      { wrapper },
    )

    const testText = `Toggle test ${Date.now()}`
    const todoId = await addTodo.current({ text: testText })

    await waitFor(
      () => {
        const todos = todoList.current as Array<{
          _id: string
          completed: boolean
        }>
        const todo = todos.find((t) => t._id === todoId)
        expect(todo).toBeDefined()
        expect(todo?.completed).toBe(false)
      },
      { timeout: 5000 },
    )

    ;(await toggleTodo.current({ id: todoId }),
      await waitFor(
        () => {
          const todos = todoList.current as Array<{
            _id: string
            completed: boolean
          }>
          const todo = todos.find((t) => t._id === todoId)
          expect(todo?.completed).toBe(true)
        },
        { timeout: 5000 },
      ))
  })

  it('should delete a todo', async () => {
    const { result: todoList } = renderHook(() => useQuery(api.todos.list), {
      wrapper,
    })

    const { result: addTodo } = renderHook(() => useMutation(api.todos.add), {
      wrapper,
    })

    const { result: removeTodo } = renderHook(
      () => useMutation(api.todos.remove),
      { wrapper },
    )

    const testText = `Delete test ${Date.now()}`
    const todoId = await addTodo.current({ text: testText })

    await waitFor(
      () => {
        const todos = todoList.current as Array<{ _id: string }>
        expect(todos.some((t) => t._id === todoId)).toBe(true)
      },
      { timeout: 5000 },
    )

    await removeTodo.current({ id: todoId })

    await waitFor(
      () => {
        const todos = todoList.current as Array<{ _id: string }>
        expect(todos.some((t) => t._id === todoId)).toBe(false)
      },
      { timeout: 5000 },
    )
  })
})
