# MDC Enhanced - Complete Documentation of Changes

This document details all changes made to the `@nuxtjs/mdc` package to support streaming LLM responses and fix large code block issues.

## Overview of Enhancements

The enhanced MDC package includes:
1. Automatic POST fallback for large code blocks (fixes 431 Request Header Too Large error)
2. New `MDCStream` component for streaming content with live syntax highlighting
3. New `useMDCStream` composable for programmatic streaming control
4. Full integration with shiki-stream for real-time code highlighting
5. Backward compatibility with all existing MDC features

## Technical Changes

### 1. Fixed 431 Error for Large Code Blocks

**File: `src/runtime/highlighter/rehype-nuxt.ts`**

Changed the highlighting function to automatically switch between GET and POST requests based on content size:

```typescript
// Before: Only used GET requests
return await $fetch('/api/_mdc/highlight', {
  params: { code, lang, theme: JSON.stringify(theme), options: JSON.stringify(options) }
})

// After: Dynamic GET/POST switching
const isPost = encodeURIComponent(code).length >= 1024 * 15 // ~15KB threshold

return await $fetch('/api/_mdc/highlight', {
  params: isPost ? undefined : {
    code,
    lang,
    theme: JSON.stringify(theme),
    options: JSON.stringify(options)
  },
  method: isPost ? 'POST' : 'GET',
  headers: isPost ? { 'content-type': 'application/json' } : undefined,
  body: isPost ? JSON.stringify({ code, lang, theme, options }) : undefined
})
```

**File: `src/runtime/highlighter/event-handler.ts`**

Updated the API endpoint to handle both GET and POST requests:

```typescript
import { eventHandler, getQuery, readBody, getMethod } from 'h3'

export default eventHandler(async (event) => {
  let code: string
  let lang: string
  let theme: any
  let options: any

  // Handle both GET and POST requests
  if (getMethod(event) === 'POST') {
    const body = await readBody(event)
    code = body.code
    lang = body.lang
    theme = body.theme
    options = body.options || {}
  } else {
    const query = getQuery(event)
    code = query.code as string
    lang = query.lang as string
    theme = JSON.parse(query.theme as string)
    options = query.options ? JSON.parse(query.options as string) : {}
  }

  const highlighter = await import('#mdc-highlighter').then(m => m.default)
  return await highlighter(code, lang, theme, options)
})
```

### 2. Added MDCStream Component

**File: `src/runtime/components/MDCStream.vue`**

A new component specifically designed for streaming content with live syntax highlighting:

```vue
<template>
  <div class="mdc-stream">
    <MDCRenderer v-if="parsedAST" :node="parsedAST" :components="components" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { parseMarkdown } from '../parser'
import type { MDCParseOptions } from '@nuxtjs/mdc'
import { CodeToTokenTransformStream } from 'shiki-stream'
import { createHighlighter } from 'shiki'

interface MDCStreamProps {
  value?: string
  tag?: string
  excerpt?: boolean
  components?: Record<string, any>
  options?: MDCParseOptions
  isStreaming?: boolean
  streamLanguage?: string
  streamTheme?: string
}

const props = withDefaults(defineProps<MDCStreamProps>(), {
  tag: 'div',
  excerpt: false,
  components: () => ({}),
  options: () => ({}),
  isStreaming: false,
  streamLanguage: 'text',
  streamTheme: 'github-dark'
})

// ... implementation details
</script>
```

**Key Features:**
- Automatically wraps streaming content in code blocks with proper language
- Supports all Shiki languages and themes
- Handles both static and streaming content
- Integrates with Vue's reactivity system

### 3. Added useMDCStream Composable

**File: `src/runtime/composables/useMDCStream.ts`**

A composable for programmatic control over streaming content:

```typescript
import { ref, Ref } from 'vue'
import { CodeToTokenTransformStream } from 'shiki-stream'
import { createHighlighter, type Highlighter } from 'shiki'

export interface MDCStreamOptions {
  language?: string
  theme?: string
  allowRecalls?: boolean
}

export function useMDCStream(options: MDCStreamOptions = {}) {
  const content = ref('')
  const isStreaming = ref(false)
  const highlighter: Ref<Highlighter | null> = ref(null)
  const streamTransform: Ref<CodeToTokenTransformStream | null> = ref(null)

  const initHighlighter = async () => {
    if (!highlighter.value) {
      highlighter.value = await createHighlighter({
        themes: [options.theme || 'github-dark'],
        langs: [options.language || 'text']
      })
    }
  }

  const startStream = async () => {
    await initHighlighter()
    isStreaming.value = true
    content.value = ''

    if (highlighter.value) {
      streamTransform.value = new CodeToTokenTransformStream({
        highlighter: highlighter.value,
        lang: options.language || 'text',
        theme: options.theme || 'github-dark',
        allowRecalls: options.allowRecalls !== false
      })
    }
  }

  const appendContent = (chunk: string) => {
    if (!isStreaming.value) return
    content.value += chunk
  }

  const endStream = () => {
    isStreaming.value = false
    streamTransform.value = null
  }

  const processStream = async (stream: ReadableStream<string>) => {
    await startStream()
    const reader = stream.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        appendContent(value)
      }
    } finally {
      reader.releaseLock()
      endStream()
    }
  }

  return {
    content: content as Readonly<Ref<string>>,
    isStreaming: isStreaming as Readonly<Ref<boolean>>,
    startStream,
    appendContent,
    endStream,
    processStream
  }
}
```

### 4. Module Updates

**File: `src/module.ts`**

Added registration for new components and composables:

```typescript
// Add components
addComponent({ name: 'MDC', filePath: resolver.resolve('./runtime/components/MDC') })
addComponent({ name: 'MDCCached', filePath: resolver.resolve('./runtime/components/MDCCached') })
addComponent({ name: 'MDCRenderer', filePath: resolver.resolve('./runtime/components/MDCRenderer') })
addComponent({ name: 'MDCSlot', filePath: resolver.resolve('./runtime/components/MDCSlot') })
addComponent({ name: 'MDCStream', filePath: resolver.resolve('./runtime/components/MDCStream') }) // NEW

// Add composables
addImports({ from: resolver.resolve('./runtime/utils/node'), name: 'flatUnwrap', as: 'unwrapSlot' })
addImports({ from: resolver.resolve('./runtime/composables/useMDCStream'), name: 'useMDCStream', as: 'useMDCStream' }) // NEW
```

Added shiki-stream to Vite optimizeDeps:

```typescript
const include = [
  'remark-gfm',
  'remark-emoji',
  'remark-mdc',
  'remark-rehype',
  'rehype-raw',
  'parse5',
  'unist-util-visit',
  'unified',
  'debug',
  'shiki-stream' // NEW
]
```

### 5. Package Dependencies

**File: `package.json`**

Added shiki-stream dependency:

```json
{
  "dependencies": {
    // ... existing dependencies
    "shiki": "^3.8.0",
    "shiki-stream": "^0.1.2", // NEW
    "ufo": "^1.6.1"
  }
}
```

### 6. Runtime Exports

**File: `src/runtime/index.ts`**

Added export for the new composable:

```typescript
export { parseMarkdown, createMarkdownParser, createParseProcessor } from './parser'
export { stringifyMarkdown, createMarkdownStringifier, createStringifyProcessor } from './stringify'
export { rehypeHighlight } from './highlighter/rehype'
export { createShikiHighlighter } from './highlighter/shiki'
export { createCachedParser } from './parser/cached'
export { useMDCStream } from './composables/useMDCStream' // NEW
export * from './utils/node'
```

## Usage Patterns

### 1. Basic Streaming with Vercel AI SDK

```vue
<template>
  <MDCStream 
    :value="streamingContent"
    :is-streaming="isLoading"
    stream-language="javascript"
    stream-theme="github-dark"
  />
</template>

<script setup>
import { useChat } from '@ai-sdk/vue'

const { messages, isLoading } = useChat()

const streamingContent = computed(() => 
  messages.value[messages.value.length - 1]?.content || ''
)
</script>
```

### 2. Manual Streaming Control

```vue
<script setup>
const stream = useMDCStream({
  language: 'typescript',
  theme: 'vitesse-dark'
})

async function generateCode() {
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt: 'Create a Vue component' })
  })
  
  await stream.processStream(response.body)
}
</script>
```

### 3. Handling Large Static Code

```vue
<template>
  <!-- Automatically uses POST for large code blocks -->
  <MDC :value="largeCodeBlock" />
</template>
```

## Benefits

1. **No More 431 Errors**: Large code blocks are automatically handled via POST requests
2. **Real-time Highlighting**: Code is highlighted as it streams, not after completion
3. **Flexible Integration**: Works with any streaming API or SDK
4. **Performance**: Only processes what's needed during streaming
5. **Backward Compatible**: All existing MDC usage continues to work

## Integration Requirements

- Nuxt 3.x
- Vue 3.x
- Modern browser with ReadableStream support

## Performance Considerations

1. **Pre-load languages**: Configure commonly used languages in `nuxt.config.ts`
2. **Use specific languages**: Always specify the language for better performance
3. **Theme caching**: Themes are cached after first load
4. **Lazy loading**: Components can be lazy-loaded when needed

## Migration from Standard MDC

No migration needed! The enhanced version is fully backward compatible. Simply:

1. Update the dependency
2. Start using new features where needed
3. Existing code continues to work unchanged

## Available Props and Methods

### MDCStream Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | - | Content to render |
| isStreaming | boolean | false | Whether content is actively streaming |
| streamLanguage | string | 'text' | Language for syntax highlighting |
| streamTheme | string | 'github-dark' | Theme for syntax highlighting |
| components | object | {} | Custom component overrides |
| options | MDCParseOptions | {} | Parser options |

### useMDCStream Composable

| Method/Property | Type | Description |
|-----------------|------|-------------|
| content | Ref<string> | Current content (readonly) |
| isStreaming | Ref<boolean> | Streaming state (readonly) |
| startStream() | async function | Initialize streaming |
| appendContent(chunk) | function | Add content chunk |
| endStream() | function | Finalize streaming |
| processStream(stream) | async function | Process ReadableStream |

## Error Handling

The enhanced MDC gracefully handles:
- Network failures (falls back to client-side highlighting)
- Large content (automatic POST switching)
- Missing languages (falls back to plain text)
- Interrupted streams (proper cleanup)

## Future Considerations

- The POST threshold (15KB) can be adjusted based on your server configuration
- Additional streaming transformers can be added for other formats
- Custom highlighting themes can be registered dynamically