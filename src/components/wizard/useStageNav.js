import { useNavigate } from "react-router-dom"
import { STAGES, stageIndex } from "@/data/stages"

/** Back/Next helpers for a stage: previous/next stage route, or the marketing page. */
export function useStageNav(stageId) {
  const navigate = useNavigate()
  const i = stageIndex(stageId)
  return {
    goBack: () => navigate(i > 0 ? STAGES[i - 1].path : "/"),
    goNext: () => navigate(STAGES[Math.min(i + 1, STAGES.length - 1)].path),
    stage: STAGES[i],
    index: i,
  }
}
