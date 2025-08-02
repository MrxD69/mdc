# CLAUDE.md for Projects Using Enhanced MDC

Copy this content to your project's CLAUDE.md file to help Claude Code understand and utilize the enhanced MDC features.

```markdown
# CLAUDE.md

This project uses an enhanced version of @nuxtjs/mdc that includes:
1. Automatic POST fallback for large code blocks (fixes 431 error)
2. Streaming support with real-time syntax highlighting for LLM responses
3. Integration with Vercel AI SDK v4

## MDC Enhanced Features

### Streaming Components

**MDCStream Component**
Use `<MDCStream>` for rendering streaming LLM responses with live syntax highlighting:
- Automatically handles code block detection and highlighting
- Supports multiple themes and languages
- Works seamlessly with streaming APIs

**useMDCStream Composable**
For programmatic control over streaming content with the following methods:
- `startStream()`: Initialize streaming session
- `appendContent(chunk)`: Add content chunks
- `endStream()`: Finalize streaming
- `processStream(stream)`: Process ReadableStream directly

### Implementation Guidelines

When implementing AI chat or code generation features:

1. **For Chat Interfaces**: Use MDCStream with Vercel AI SDK
   ```vue
   <MDCStream 
     :value="message.content"
     :is-streaming="isCurrentMessageStreaming"
     stream-language="javascript"
   />
   ```

2. **For Code Generation**: Use useMDCStream composable
   ```typescript
   const stream = useMDCStream({ language: 'typescript' })
   // Process streaming response
   await stream.processStream(response.body)
   ```

3. **For Large Static Code**: Regular MDC component auto-handles large blocks
   ```vue
   <MDC :value="largeCodeContent" />
   ```

### Important Notes

- The package automatically switches to POST requests for code blocks >15KB
- No configuration needed for the 431 error fix - it works automatically
- Streaming requires proper language specification for optimal highlighting
- Pre-load languages in nuxt.config.ts for better performance

### Common Patterns

**AI Assistant Response**
```vue
<div v-for="message in messages">
  <MDCStream 
    v-if="message.role === 'assistant'"
    :value="message.content"
    :is-streaming="message.isStreaming"
    stream-language="javascript"
  />
</div>
```

**Code Editor with Preview**
```vue
<div class="editor">
  <textarea v-model="code" />
  <MDC :value="wrapInCodeBlock(code, language)" />
</div>
```

**Streaming Code Generator**
```vue
const { content, isStreaming, processStream } = useMDCStream()
const response = await fetch('/api/generate')
await processStream(response.body)
```

### Available Props and Options

MDCStream Props:
- value: string (required) - Content to render
- isStreaming: boolean - Active streaming state
- streamLanguage: string - Language for highlighting
- streamTheme: string - Theme name
- components: object - Custom component overrides
- options: MDCParseOptions - Parser options

useMDCStream Options:
- language: string - Default language
- theme: string - Default theme  
- allowRecalls: boolean - Enable recall tokens

### Performance Considerations

- Use lazy loading for streaming components when possible
- Pre-configure commonly used languages in nuxt.config.ts
- Consider using MDCCached for repeated content
- Streaming performs best with specific language hints

### Testing Streaming Features

To test streaming locally:
1. Create an API endpoint that returns a streaming response
2. Use fetch with response.body or Vercel AI SDK
3. Process the stream with MDCStream or useMDCStream
4. Verify syntax highlighting updates in real-time

The enhanced MDC handles all edge cases automatically, including very large code blocks and interrupted streams.
```

## Example Implementation Prompt for Claude Code

When asking Claude Code to implement features using the enhanced MDC in your project, use this prompt:

```
I'm using an enhanced version of @nuxtjs/mdc that includes streaming support and automatic POST fallback for large code blocks. 

Please implement [YOUR FEATURE REQUEST] using these enhanced MDC features:

1. Use <MDCStream> component for any streaming LLM responses
2. Use useMDCStream() composable for programmatic streaming control  
3. Regular <MDC> component automatically handles large code blocks

Key props for MDCStream:
- :value="content"
- :is-streaming="boolean"
- :stream-language="javascript|python|etc"
- :stream-theme="github-dark|vitesse-dark|etc"

The package is already installed and configured. Focus on using these components effectively for the best user experience with streaming content and syntax highlighting.

Additional context: [ADD YOUR SPECIFIC REQUIREMENTS]
```

## Quick Reference Card

```typescript
// Component usage
<MDCStream 
  :value="streamingContent"
  :is-streaming="isActivelyStreaming"
  stream-language="javascript"
  stream-theme="github-dark"
/>

// Composable usage
import { useMDCStream } from '@nuxtjs/mdc'

const stream = useMDCStream({
  language: 'javascript',
  theme: 'github-dark'
})

// Start streaming
await stream.startStream()
stream.appendContent('function hello() {')
stream.appendContent('\n  console.log("Hello")')
stream.appendContent('\n}')
stream.endStream()

// Or process a stream directly
const response = await fetch('/api/stream')
await stream.processStream(response.body)

// Access reactive values
console.log(stream.content.value) // Current content
console.log(stream.isStreaming.value) // Streaming state
```