import { QUESTS } from '@/game/quests/definitions.ts'
import { getDialog } from '@/content/dialog/dialog.ts'
import type { GameState } from '@/game/core/types.ts'
import { getActiveStoryQuests, getObjectiveStatus } from '@/game/story/index.ts'

interface QuestPanelProps {
  game: GameState
}

export function QuestPanel({ game }: QuestPanelProps) {
  const quest = QUESTS.find((q) => q.id === game.activeQuestId)
  const storyQuests = getActiveStoryQuests(game)

  return (
    <aside className="quest-panel">
      <div className="quest-panel__group">
        <h3>Main Task</h3>
        {quest ? (
          <p>{getDialog(quest.titleKey)}: {getDialog(quest.bodyKey)}</p>
        ) : (
          <p className="muted">No active trade tutorial task — you are free to trade.</p>
        )}
      </div>

      <div className="quest-panel__group">
        <h3>Road Stories</h3>
        {storyQuests.length > 0 ? (
          <div className="quest-panel__stories">
            {storyQuests.map((storyQuest) => {
              const nextObjective =
                storyQuest.objectives
                  .map((objective) => getObjectiveStatus(game, objective))
                  .find((entry) => !entry.done) ??
                storyQuest.objectives
                  .map((objective) => getObjectiveStatus(game, objective))[0]
              return (
                <div key={storyQuest.id} className="quest-panel__story">
                  <strong>{getDialog(storyQuest.titleKey)}</strong>
                  <span>{nextObjective?.label ?? getDialog(storyQuest.bodyKey)}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="muted">No active story threads yet. Talk to people in town.</p>
        )}
      </div>
    </aside>
  )
}