# MDC Enhanced - Streaming & Large Code Block Support Guide

This enhanced version of `@nuxtjs/mdc` includes fixes for large code blocks (431 error) and adds streaming support for LLM responses with real-time syntax highlighting.

## Installation

### Option 1: Using the Local Package

1. **Build the enhanced MDC package:**
   ```bash
   cd /path/to/mdc
   pnpm install
   pnpm build
   ```

2. **Link it globally:**
   ```bash
   pnpm link --global
   ```

3. **In your Nuxt project:**
   ```bash
   pnpm link --global @nuxtjs/mdc
   ```

### Option 2: Publishing as Scoped Package

1. **Update package.json in the MDC folder:**
   ```json
   {
     "name": "@your-username/mdc-enhanced",
     "version": "0.17.3"
   }
   ```

2. **Publish to npm:**
   ```bash
   npm publish --access public
   ```

3. **Install in your project:**
   ```bash
   pnpm add @your-username/mdc-enhanced
   ```

### Option 3: Using Git Repository

1. **Install directly from your fork:**
   ```bash
   pnpm add github:your-username/mdc#main
   ```

## Configuration

### 1. Add to nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/mdc' // or '@your-username/mdc-enhanced'
  ],
  
  mdc: {
    highlight: {
      theme: 'github-dark', // Default theme
      langs: ['js', 'ts', 'vue', 'css', 'json', 'bash', 'python'] // Preload languages
    },
    components: {
      prose: true // Enable prose components
    }
  }
})
```

### 2. TypeScript Support

Create or update `types/mdc.d.ts`:

```typescript
declare module '#app' {
  interface NuxtApp {
    $mdc: {
      parseMarkdown: (content: string, options?: any) => Promise<any>
    }
  }
}

declare module '@nuxtjs/mdc' {
  export function useMDCStream(options?: {
    language?: string
    theme?: string
    allowRecalls?: boolean
  }): {
    content: Readonly<Ref<string>>
    isStreaming: Readonly<Ref<boolean>>
    startStream: () => Promise<void>
    appendContent: (chunk: string) => void
    endStream: () => void
    processStream: (stream: ReadableStream<string>) => Promise<void>
  }
}

export {}
```

## Usage Examples

### 1. Basic MDC Usage (No Changes)

```vue
<template>
  <MDC :value="content" />
</template>

<script setup>
const content = ref(`
# Hello World

This is **markdown** with \`code\`.

\`\`\`javascript
console.log('Hello MDC!')
\`\`\`
`)
</script>
```

### 2. Streaming with Vercel AI SDK v4

```vue
<template>
  <div class="chat-container">
    <div v-for="message in messages" :key="message.id" class="message">
      <div v-if="message.role === 'user'" class="user-message">
        {{ message.content }}
      </div>
      <div v-else class="assistant-message">
        <MDCStream 
          :value="message.content"
          :is-streaming="isLoading && message.id === messages[messages.length - 1]?.id"
          stream-language="javascript"
          stream-theme="github-dark"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChat } from '@ai-sdk/vue'

const { messages, input, handleSubmit, isLoading } = useChat({
  api: '/api/chat'
})
</script>
```

### 3. Using the Composable with Custom Streaming

```vue
<template>
  <div>
    <button @click="streamCode" :disabled="stream.isStreaming.value">
      Generate Code
    </button>
    
    <div class="code-output">
      <MDC :value="formattedContent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMDCStream } from '@nuxtjs/mdc'

const stream = useMDCStream({
  language: 'typescript',
  theme: 'vitesse-dark'
})

// Format content as markdown code block
const formattedContent = computed(() => {
  if (!stream.content.value) return ''
  return `\`\`\`typescript\n${stream.content.value}\n\`\`\``
})

async function streamCode() {
  await stream.startStream()
  
  try {
    const response = await fetch('/api/generate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Generate a Vue component' })
    })
    
    if (!response.body) throw new Error('No response body')
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      stream.appendContent(chunk)
    }
  } finally {
    stream.endStream()
  }
}
</script>
```

### 4. Handling Large Code Blocks

The package automatically handles large code blocks by switching to POST requests:

```vue
<template>
  <!-- This will work even with very large code blocks -->
  <MDC :value="largeCodeContent" />
</template>

<script setup>
const largeCodeContent = ref(`
\`\`\`javascript
// This can be a very large code block (>15KB)
// The package will automatically use POST instead of GET
${generateLargeCode()}
\`\`\`
`)
</script>
```

### 5. Advanced Streaming with Multiple Languages

```vue
<template>
  <div class="code-editor">
    <select v-model="language">
      <option value="javascript">JavaScript</option>
      <option value="python">Python</option>
      <option value="rust">Rust</option>
    </select>
    
    <MDCStream
      :value="stream.content.value"
      :is-streaming="stream.isStreaming.value"
      :stream-language="language"
      :stream-theme="isDark ? 'github-dark' : 'github-light'"
      :components="customComponents"
    />
  </div>
</template>

<script setup>
import { useMDCStream } from '@nuxtjs/mdc'
import { useColorMode } from '@vueuse/core'

const { isDark } = useColorMode()
const language = ref('javascript')

const stream = useMDCStream({
  language: language.value,
  theme: isDark.value ? 'github-dark' : 'github-light'
})

// Custom components for MDC
const customComponents = {
  pre: defineComponent({
    setup(_, { slots }) {
      return () => h('pre', { class: 'custom-pre' }, slots.default?.())
    }
  })
}

// Watch for language changes
watch(language, async (newLang) => {
  if (stream.isStreaming.value) {
    stream.endStream()
    await stream.startStream()
  }
})
</script>
```

## API Reference

### Components

#### `<MDCStream>`

Enhanced MDC component with streaming support.

**Props:**
- `value` (string): The content to render
- `isStreaming` (boolean): Whether content is currently streaming
- `streamLanguage` (string): Language for syntax highlighting during streaming
- `streamTheme` (string): Theme for syntax highlighting
- `components` (object): Custom components to use for rendering
- `options` (object): MDC parsing options

#### `<MDC>` (unchanged)

Standard MDC component - works as before but now handles large code blocks.

### Composables

#### `useMDCStream(options)`

**Options:**
- `language`: Default language for highlighting
- `theme`: Default theme for highlighting
- `allowRecalls`: Enable token recalls for context-aware highlighting

**Returns:**
- `content`: Readonly ref containing the current content
- `isStreaming`: Readonly ref indicating streaming status
- `startStream()`: Initialize streaming
- `appendContent(chunk)`: Add content chunk
- `endStream()`: Finalize streaming
- `processStream(stream)`: Process a ReadableStream

## Common Integration Patterns

### With OpenAI SDK

```typescript
// server/api/chat.post.ts
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

export default defineEventHandler(async (event) => {
  const { prompt } = await readBody(event)
  
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true
  })
  
  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
})
```

### With Anthropic SDK

```typescript
// server/api/claude-chat.post.ts
import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const { prompt } = await readBody(event)
  
  const stream = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
    max_tokens: 4096
  })
  
  return sendStream(event, stream)
})
```

## Troubleshooting

### Issue: 431 Request Header Fields Too Large

This should be automatically fixed, but if you still encounter it:

1. Check that you're using the enhanced version
2. Verify the POST fallback is working by checking network requests
3. Ensure your server accepts POST requests to `/api/_mdc/highlight`

### Issue: Streaming not showing highlights

1. Ensure the language is supported
2. Pre-load languages in nuxt.config.ts
3. Check browser console for errors

### Issue: TypeScript errors

Add the type declarations as shown above and restart your TypeScript server.

## Performance Tips

1. **Pre-load common languages** in nuxt.config.ts
2. **Use language-specific streaming** instead of auto-detection
3. **Enable component caching** for repeated content:
   ```vue
   <MDCCached :value="content" :cache-key="contentHash" />
   ```

4. **Lazy load the streaming component** for better initial load:
   ```vue
   <LazyMDCStream v-if="needsStreaming" :value="content" />
   ```