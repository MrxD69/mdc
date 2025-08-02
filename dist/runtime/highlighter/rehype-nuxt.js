import { rehypeHighlight as rehypeHighlightUniversal } from "./rehype.js";
const defaults = {
  theme: {},
  async highlighter(code, lang, theme, options) {
    try {
      if (import.meta.client && window.sessionStorage.getItem("mdc-shiki-highlighter") === "browser") {
        return import("#mdc-highlighter").then((h) => h.default(code, lang, theme, options)).catch(() => ({}));
      }
      const isPost = encodeURIComponent(code).length >= 1024 * 15;
      return await $fetch("/api/_mdc/highlight", {
        params: isPost ? void 0 : {
          code,
          lang,
          theme: JSON.stringify(theme),
          options: JSON.stringify(options)
        },
        method: isPost ? "POST" : "GET",
        headers: isPost ? { "content-type": "application/json" } : void 0,
        body: isPost ? JSON.stringify({ code, lang, theme, options }) : void 0
      });
    } catch (e) {
      if (import.meta.client && e?.response?.status === 404) {
        window.sessionStorage.setItem("mdc-shiki-highlighter", "browser");
        return this.highlighter?.(code, lang, theme, options);
      }
    }
    return Promise.resolve({ tree: [{ type: "text", value: code }], className: "", style: "" });
  }
};
export default rehypeHighlight;
export function rehypeHighlight(opts = {}) {
  const options = { ...defaults, ...opts };
  if (typeof options.highlighter !== "function") {
    options.highlighter = defaults.highlighter;
  }
  return rehypeHighlightUniversal(options);
}
