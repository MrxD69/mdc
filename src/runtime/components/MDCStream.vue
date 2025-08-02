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

const parsedAST = ref<any>(null)
const streamBuffer = ref('')

// Parse content when value changes
const parseContent = async (content: string) => {
  if (!content) {
    parsedAST.value = null
    return
  }

  try {
    const parsed = await parseMarkdown(content, {
      remark: props.options.remark || {},
      rehype: props.options.rehype || {},
      highlight: props.options.highlight || {}
    })
    parsedAST.value = parsed
  } catch (error) {
    console.error('Error parsing MDC content:', error)
    parsedAST.value = null
  }
}

// Handle streaming mode
const handleStreamingContent = async (content: string) => {
  if (!props.isStreaming) {
    await parseContent(content)
    return
  }

  // For streaming, wrap content in a code block with proper highlighting
  const wrappedContent = `\`\`\`${props.streamLanguage}\n${content}\n\`\`\``
  await parseContent(wrappedContent)
}

// Watch for changes in the value prop
watch(() => props.value, async (newValue) => {
  if (newValue !== undefined) {
    await handleStreamingContent(newValue)
  }
}, { immediate: true })

// Support for direct streaming with shiki-stream
const createStreamingHighlighter = async () => {
  if (!props.isStreaming) return null

  try {
    const highlighter = await createHighlighter({
      themes: [props.streamTheme],
      langs: [props.streamLanguage]
    })

    return new CodeToTokenTransformStream({
      highlighter,
      lang: props.streamLanguage,
      theme: props.streamTheme,
      allowRecalls: true
    })
  } catch (error) {
    console.error('Error creating streaming highlighter:', error)
    return null
  }
}

// Expose method for external streaming
defineExpose({
  parseContent,
  handleStreamingContent,
  createStreamingHighlighter
})
</script>

<style scoped>
.mdc-stream {
  position: relative;
}
</style>