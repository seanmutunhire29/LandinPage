/** Nest flat file paths into { dirs: { name: node }, files: [path] } for tree views. */
export function buildTree(paths) {
  const root = { dirs: {}, files: [] }
  for (const path of paths) {
    const parts = path.split("/")
    let node = root
    parts.slice(0, -1).forEach((part, i) => {
      node.dirs[part] ??= { dirs: {}, files: [], path: parts.slice(0, i + 1).join("/") }
      node = node.dirs[part]
    })
    node.files.push(path)
  }
  return root
}
