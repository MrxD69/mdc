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

  // Helper for processing streaming responses from AI SDKs
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