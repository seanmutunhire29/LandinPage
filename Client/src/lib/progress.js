import { STAGES } from "@/data/stages"
import { COMPONENT_IDS } from "@/lib/filters"

const CHECKS = {
  direction: (s) => Boolean(s.direction),
  typography: (s) => Boolean(s.typography),
  color: (s) => Boolean(s.palette),
  surface: (s) => Boolean(s.surface),
  components: (s) => COMPONENT_IDS.every((id) => s.components[id]),
  layout: (s) => s.sections.length >= 2 && s.sections.every((x) => x.variant),
  motion: (s) => Boolean(s.motion),
  review: () => true,
}

export const isStageComplete = (id, state) => CHECKS[id](state)

/** Index of the first stage that still needs input (review if everything is done). */
export function firstIncompleteIndex(state) {
  const i = STAGES.findIndex((s) => !isStageComplete(s.id, state))
  return i === -1 ? STAGES.length - 1 : i
}

/** A stage is reachable when every stage before it is complete. */
export const canVisit = (index, state) => index <= firstIncompleteIndex(state)
