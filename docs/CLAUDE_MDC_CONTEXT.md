# Claude Code Context for Enhanced MDC

Add this to your project's CLAUDE.md file to help Claude Code understand and utilize the enhanced MDC features.

```markdown
## Enhanced MDC Package

This project uses an enhanced version of `@nuxtjs/mdc` (github:MrxD69/mdc) with the following improvements:

### Key Enhancements

1. **Automatic 431 Error Fix**: Large code blocks (>15KB) automatically use POST requests instead of GET
2. **Streaming Support**: New `MDCStream` component for real-time LLM response rendering
3. **Programmatic Streaming**: `useMDCStream` composable for manual streaming control
4. **Shiki-Stream Integration**: Live syntax highlighting during streaming

### Available Components

#### MDCStream
For streaming content with live syntax highlighting:
```vue
<MDCStream 
  :value="content"
  :is-streaming="isActivelyStreaming"
  stream-language="javascript"
  stream-theme="github-dark"
/>
```

#### MDC (Enhanced)
Regular MDC component now automatically handles large code blocks:
```vue
<MDC :value="markdownContent" />
```

### Available Composables

#### useMDCStream
For programmatic streaming control:
```typescript
const stream = useMDCStream({
  language: 'javascript',
  theme: 'github-dark'
})

// Manual streaming
await stream.startStream()
stream.appendContent('function hello() {')
stream.appendContent('\n  console.log("Hello")')
stream.appendContent('\n}')
stream.endStream()

// Or process a ReadableStream
await stream.processStream(response.body)
```

### Common Patterns

#### With Vercel AI SDK v4
```vue
<template>
  <div v-for="message in messages" :key="message.id">
    <MDCStream 
      v-if="message.role === 'assistant'"
      :value="message.content"
      :is-streaming="isLoading && message === messages[messages.length - 1]"
      stream-language="javascript"
    />
  </div>
</template>

<script setup>
import { useChat } from '@ai-sdk/vue'
const { messages, isLoading } = useChat()
</script>
```

#### For Code Generation
```vue
<template>
  <button @click="generateCode">Generate</button>
  <MDC :value="formattedContent" />
</template>

<script setup>
const stream = useMDCStream({ language: 'typescript' })

const formattedContent = computed(() => 
  stream.content.value ? `\`\`\`typescript\n${stream.content.value}\n\`\`\`` : ''
)

async function generateCode() {
  const response = await fetch('/api/generate-code', { method: 'POST' })
  await stream.processStream(response.body)
}
</script>
```

### Technical Details

- **POST Threshold**: 15KB (encoded content)
- **Streaming**: Uses ReadableStream API
- **Highlighting**: Powered by Shiki with streaming support
- **Performance**: Pre-load languages in nuxt.config.ts

### Best Practices

1. Always specify `stream-language` for better performance
2. Use `isStreaming` prop to indicate active streaming
3. Pre-configure commonly used languages in nuxt.config.ts
4. Use lazy loading for streaming components when possible

### Do's and Don'ts

✅ DO:
- Use MDCStream for AI/LLM responses
- Specify language for code blocks
- Use the composable for fine-grained control
- Let regular MDC handle large static content

❌ DON'T:
- Use MDCStream for static content
- Forget to set isStreaming to false when done
- Mix streaming and non-streaming in same component

### Error Handling

The package handles these automatically:
- 431 errors → switches to POST
- Network failures → client-side highlighting
- Missing languages → plain text fallback
- Interrupted streams → proper cleanup
```

## Quick Reference for Common Tasks

### Task: Display AI Chat Response
```vue
<MDCStream 
  :value="message.content" 
  :is-streaming="message.isGenerating"
  stream-language="javascript"
/>
```

### Task: Stream Code Generation
```typescript
const stream = useMDCStream({ language: 'python' })
const response = await fetch('/api/generate-python')
await stream.processStream(response.body)
```

### Task: Display Large Code Block
```vue
<!-- Just use regular MDC, it handles large blocks automatically -->
<MDC :value="largeCodeContent" />
```

### Task: Custom Streaming Logic
```typescript
const stream = useMDCStream()
await stream.startStream()

for await (const chunk of customGenerator()) {
  stream.appendContent(chunk)
}

stream.endStream()
```

## Configuration in nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/mdc'],
  
  mdc: {
    highlight: {
      theme: 'github-dark',
      // Pre-load languages for better performance
      langs: ['js', 'ts', 'vue', 'python', 'bash', 'json']
    }
  }
})
```

## TypeScript Types

```typescript
// Component props
interface MDCStreamProps {
  value?: string
  isStreaming?: boolean
  streamLanguage?: string
  streamTheme?: string
  components?: Record<string, any>
  options?: MDCParseOptions
}

// Composable options
interface MDCStreamOptions {
  language?: string
  theme?: string
  allowRecalls?: boolean
}

// Composable return type
interface MDCStreamReturn {
  content: Readonly<Ref<string>>
  isStreaming: Readonly<Ref<boolean>>
  startStream: () => Promise<void>
  appendContent: (chunk: string) => void
  endStream: () => void
  processStream: (stream: ReadableStream<string>) => Promise<void>
}
```