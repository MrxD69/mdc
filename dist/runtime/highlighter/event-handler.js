import { eventHandler, getQuery, readBody, getMethod } from "h3";
export default eventHandler(async (event) => {
  let code;
  let lang;
  let theme;
  let options;
  if (getMethod(event) === "POST") {
    const body = await readBody(event);
    code = body.code;
    lang = body.lang;
    theme = body.theme;
    options = body.options || {};
  } else {
    const query = getQuery(event);
    code = query.code;
    lang = query.lang;
    theme = JSON.parse(query.theme);
    options = query.options ? JSON.parse(query.options) : {};
  }
  const highlighter = await import("#mdc-highlighter").then((m) => m.default);
  return await highlighter(code, lang, theme, options);
});
