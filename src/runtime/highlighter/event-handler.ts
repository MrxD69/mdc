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
