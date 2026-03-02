import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api.js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach((line) => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const CONVEX_URL = envVars.VITE_CONVEX_URL

if (!CONVEX_URL) {
  console.error('❌ VITE_CONVEX_URL is not set')
  process.exit(1)
}

const client = new ConvexHttpClient(CONVEX_URL)

async function testConvex() {
  console.log('🔗 Testing Convex connection...')
  console.log(`📍 URL: ${CONVEX_URL}\n`)

  try {
    // Test 1: List todos
    console.log('1️⃣ Testing todos.list query...')
    const todos = await client.query(api.todos.list)
    console.log(`✅ Success! Found ${todos.length} todo(s)`)
    console.log('Current todos:', JSON.stringify(todos, null, 2))
    console.log()

    // Test 2: Add a todo
    console.log('2️⃣ Testing todos.add mutation...')
    const testText = `Test todo ${new Date().toISOString()}`
    const newTodoId = await client.mutation(api.todos.add, { text: testText })
    console.log(`✅ Success! Added todo with ID: ${newTodoId}`)
    console.log()

    // Test 3: Verify the todo was added
    console.log('3️⃣ Verifying todo was added...')
    const updatedTodos = await client.query(api.todos.list)
    const addedTodo = updatedTodos.find((t) => t._id === newTodoId)
    if (addedTodo) {
      console.log('✅ Success! Todo found in list')
      console.log('Added todo:', JSON.stringify(addedTodo, null, 2))
    } else {
      console.log('❌ Failed! Todo not found in list')
    }
    console.log()

    // Test 4: Toggle the todo
    console.log('4️⃣ Testing todos.toggle mutation...')
    await client.mutation(api.todos.toggle, { id: newTodoId })
    const toggledTodos = await client.query(api.todos.list)
    const toggledTodo = toggledTodos.find((t) => t._id === newTodoId)
    if (toggledTodo) {
      console.log(
        `✅ Success! Todo toggled to completed: ${toggledTodo.completed}`,
      )
    }
    console.log()

    // Test 5: Delete the test todo
    console.log('5️⃣ Testing todos.remove mutation...')
    await client.mutation(api.todos.remove, { id: newTodoId })
    const finalTodos = await client.query(api.todos.list)
    const deletedTodo = finalTodos.find((t) => t._id === newTodoId)
    if (!deletedTodo) {
      console.log('✅ Success! Todo was deleted')
    } else {
      console.log('❌ Failed! Todo still exists')
    }
    console.log()

    console.log('🎉 All Convex tests passed!')
    console.log(`📊 Final state: ${finalTodos.length} todo(s) remaining`)
    if (finalTodos.length > 0) {
      console.log('Remaining todos:', JSON.stringify(finalTodos, null, 2))
    }
  } catch (error) {
    console.error('\n❌ Error testing Convex:', error)
    process.exit(1)
  }
}

testConvex()
