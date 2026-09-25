const TOKEN = /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g

const CLASSES = {
  key: "text-[#9cdcfe]",
  string: "text-[#ce9178]",
  number: "text-[#b5cea8]",
  literal: "text-[#569cd6]",
}

/** Turns a JSON string into React nodes with token-level coloring. */
export function highlightJson(json) {
  const out = []
  let last = 0
  let i = 0
  for (const match of json.matchAll(TOKEN)) {
    const [token] = match
    if (match.index > last) out.push(json.slice(last, match.index))
    let kind = "number"
    if (token.startsWith('"')) kind = match[2] ? "key" : "string"
    else if (/^(true|false|null)$/.test(token)) kind = "literal"
    out.push(
      <span key={i++} className={CLASSES[kind]}>
        {token}
      </span>
    )
    last = match.index + token.length
  }
  if (last < json.length) out.push(json.slice(last))
  return out
}
