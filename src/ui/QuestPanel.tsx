import { QUESTS } from '@/game/quests/definitions.ts'
import { getDialog } from '@/content/dialog/dialog.ts'

interface QuestPanelProps {
  activeQuestId: string | null
}

export function QuestPanel({ activeQuestId }: QuestPanelProps) {
  const quest = QUESTS.find((q) => q.id === activeQuestId)
  if (!quest) {
    return (
      <aside className="quest-panel">
        <h3>Current task</h3>
        <p className="muted">No active task. You are free to trade.</p>
      </aside>
    )
  }
  return (
    <aside className="quest-panel">
      <h3>{getDialog(quest.titleKey)}</h3>
      <p>{getDialog(quest.bodyKey)}</p>
    </aside>
  )
}