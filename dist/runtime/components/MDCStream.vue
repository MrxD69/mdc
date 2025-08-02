<template>
  <div class="mdc-stream">
    <MDCRenderer v-if="parsedAST" :node="parsedAST" :components="components" />
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { parseMarkdown } from "../parser";
import { CodeToTokenTransformStream } from "shiki-stream";
import { getHighlighter } from "shiki";
const props = defineProps({
  value: { type: String, required: false },
  tag: { type: String, required: false, default: "div" },
  excerpt: { type: Boolean, required: false, default: false },
  components: { type: Object, required: false, default: () => ({}) },
  options: { type: null, required: false, default: () => ({}) },
  isStreaming: { type: Boolean, required: false, default: false },
  streamLanguage: { type: String, required: false, default: "text" },
  streamTheme: { type: String, required: false, default: "github-dark" }
});
const parsedAST = ref(null);
const streamBuffer = ref("");
const parseContent = async (content) => {
  if (!content) {
    parsedAST.value = null;
    return;
  }
  try {
    const parsed = await parseMarkdown(content, {
      remark: props.options.remark || {},
      rehype: props.options.rehype || {},
      highlight: props.options.highlight || {}
    });
    parsedAST.value = parsed;
  } catch (error) {
    console.error("Error parsing MDC content:", error);
    parsedAST.value = null;
  }
};
const handleStreamingContent = async (content) => {
  if (!props.isStreaming) {
    await parseContent(content);
    return;
  }
  const wrappedContent = `\`\`\`${props.streamLanguage}
${content}
\`\`\``;
  await parseContent(wrappedContent);
};
watch(() => props.value, async (newValue) => {
  if (newValue !== void 0) {
    await handleStreamingContent(newValue);
  }
}, { immediate: true });
const createStreamingHighlighter = async () => {
  if (!props.isStreaming) return null;
  try {
    const highlighter = await getHighlighter({
      themes: [props.streamTheme],
      langs: [props.streamLanguage]
    });
    return new CodeToTokenTransformStream({
      highlighter,
      lang: props.streamLanguage,
      theme: props.streamTheme,
      allowRecalls: true
    });
  } catch (error) {
    console.error("Error creating streaming highlighter:", error);
    return null;
  }
};
defineExpose({
  parseContent,
  handleStreamingContent,
  createStreamingHighlighter
});
</script>

<style scoped>
.mdc-stream{position:relative}
</style>
