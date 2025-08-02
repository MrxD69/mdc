<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">MDC Streaming Example</h1>
    
    <div class="mb-4">
      <button 
        @click="startStreaming" 
        :disabled="stream.isStreaming.value"
        class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {{ stream.isStreaming.value ? 'Streaming...' : 'Start Streaming' }}
      </button>
    </div>

    <div class="border rounded-lg p-4">
      <h2 class="text-lg font-semibold mb-2">Streaming Content:</h2>
      <MDCStream 
        :value="stream.content.value" 
        :is-streaming="stream.isStreaming.value"
        :stream-language="'javascript'"
        :stream-theme="'github-dark'"
      />
    </div>

    <div class="mt-8 border rounded-lg p-4">
      <h2 class="text-lg font-semibold mb-2">Regular MDC Content:</h2>
      <MDC :value="regularContent" />
    </div>
  </div>
</template>

<script setup>
const stream = useMDCStream({
  language: 'javascript',
  theme: 'github-dark'
})

const regularContent = ref(`
# Regular MDC Content

This is regular MDC content with **bold** and *italic* text.

\`\`\`javascript
// This is a code block
function hello() {
  console.log('Hello, MDC!')
}
\`\`\`
`)

// Simulate streaming content (e.g., from an AI model)
const startStreaming = async () => {
  await stream.startStream()
  
  const code = `// Streaming example
function calculateSum(numbers) {
  return numbers.reduce((acc, num) => acc + num, 0)
}

const numbers = [1, 2, 3, 4, 5]
const result = calculateSum(numbers)
console.log('Sum:', result)

// More complex example
class DataProcessor {
  constructor(data) {
    this.data = data
  }
  
  process() {
    return this.data.map(item => ({
      ...item,
      processed: true,
      timestamp: new Date().toISOString()
    }))
  }
}

const processor = new DataProcessor([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
])

console.log(processor.process())`

  // Simulate character-by-character streaming
  for (const char of code) {
    stream.appendContent(char)
    await new Promise(resolve => setTimeout(resolve, 10)) // 10ms delay between characters
  }
  
  stream.endStream()
}
</script>