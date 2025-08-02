import { ref } from "vue";
import { CodeToTokenTransformStream } from "shiki-stream";
import { createHighlighter } from "shiki";
export function useMDCStream(options = {}) {
  const content = ref("");
  const isStreaming = ref(false);
  const highlighter = ref(null);
  const streamTransform = ref(null);
  const initHighlighter = async () => {
    if (!highlighter.value) {
      highlighter.value = await createHighlighter({
        themes: [options.theme || "github-dark"],
        langs: [options.language || "text"]
      });
    }
  };
  const startStream = async () => {
    await initHighlighter();
    isStreaming.value = true;
    content.value = "";
    if (highlighter.value) {
      streamTransform.value = new CodeToTokenTransformStream({
        highlighter: highlighter.value,
        lang: options.language || "text",
        theme: options.theme || "github-dark",
        allowRecalls: options.allowRecalls !== false
      });
    }
  };
  const appendContent = (chunk) => {
    if (!isStreaming.value) return;
    content.value += chunk;
  };
  const endStream = () => {
    isStreaming.value = false;
    streamTransform.value = null;
  };
  const processStream = async (stream) => {
    await startStream();
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        appendContent(value);
      }
    } finally {
      reader.releaseLock();
      endStream();
    }
  };
  return {
    content,
    isStreaming,
    startStream,
    appendContent,
    endStream,
    processStream
  };
}
