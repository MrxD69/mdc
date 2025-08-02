import type { HighlightResult, RehypeHighlightOption } from '@nuxtjs/mdc'
import { rehypeHighlight as rehypeHighlightUniversal } from './rehype'

const defaults: RehypeHighlightOption = {
  theme: {},
  async highlighter(code, lang, theme, options) {
    try {
      if (import.meta.client && window.sessionStorage.getItem('mdc-shiki-highlighter') === 'browser') {
        return import('#mdc-highlighter').then(h => h.default(code, lang, theme, options)).catch(() => ({}))
      }

      // Check if the request is too large for GET method
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
    } catch (e: any) {
      if (import.meta.client && e?.response?.status === 404) {
        window.sessionStorage.setItem('mdc-shiki-highlighter', 'browser')
        return this.highlighter?.(code, lang, theme, options)
      }
    }

    return Promise.resolve({ tree: [{ type: 'text', value: code }], className: '', style: '' } as HighlightResult)
  }
}
export default rehypeHighlight

export function rehypeHighlight(opts: Partial<RehypeHighlightOption> = {}) {
  const options = { ...defaults, ...opts } as RehypeHighlightOption

  if (typeof options.highlighter !== 'function') {
    options.highlighter = defaults.highlighter
  }

  return rehypeHighlightUniversal(options)
}
