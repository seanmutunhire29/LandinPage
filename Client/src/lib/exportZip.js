import { strToU8, zip } from "fflate"

export const slugify = (name) =>
  (name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "project"

/**
 * Zip `paths` from the `files` map (path -> content) under a folder named after
 * the project, and hand the archive to the browser as a download.
 */
export function downloadZip(projectName, files, paths = Object.keys(files)) {
  const root = slugify(projectName)
  const entries = Object.fromEntries(paths.map((p) => [`${root}/${p}`, strToU8(files[p] ?? "")]))

  return new Promise((resolve, reject) =>
    zip(entries, { level: 6 }, (err, data) => {
      if (err) return reject(err)
      const url = URL.createObjectURL(new Blob([data], { type: "application/zip" }))
      const a = Object.assign(document.createElement("a"), { href: url, download: `${root}.zip` })
      document.body.append(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      resolve()
    })
  )
}
