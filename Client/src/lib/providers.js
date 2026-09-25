// Visual identity for each model provider. Labels, key links and suggested models
// come from the server (GET /providers); this only adds the tile colour and mark.

export const PROVIDER_STYLE = {
  anthropic: { mark: "C", bg: "#d97757", fg: "#ffffff" },
  openai: { mark: "O", bg: "#10a37f", fg: "#ffffff" },
  deepseek: { mark: "D", bg: "#4d6bfe", fg: "#ffffff" },
  kimi: { mark: "K", bg: "#181b34", fg: "#ffffff" },
  openrouter: { mark: "R", bg: "#6467f2", fg: "#ffffff" },
}

export const providerStyle = (id) => PROVIDER_STYLE[id] ?? { mark: (id ?? "?")[0]?.toUpperCase(), bg: "#676879", fg: "#ffffff" }

/** "anthropic/claude-haiku-4.5" -> "claude-haiku-4.5" for compact labels. */
export const shortModel = (model = "") => model.split("/").pop()
