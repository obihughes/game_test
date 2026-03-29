import { useEffect, useMemo, useState } from 'react'
import { getDialog } from '@/content/dialog/dialog.ts'
import type { GameState } from '@/game/core/types.ts'
import {
  getNpcQuestSummary,
  getNpcRelationship,
  getObjectiveStatus,
  getStoryNode,
  getStoryNpcById,
  getStoryNpcsForTown,
  getStoryQuestById,
  getVisibleOptions,
} from '@/game/story/index.ts'
import { useGameStore } from '@/store/gameStore.ts'
import { NpcPortrait } from '@/ui/icons/NpcPortrait.tsx'

function favorLabel(favor: number): string {
  if (favor >= 20) return 'Trusted'
  if (favor >= 8) return 'Warm'
  if (favor <= -10) return 'Suspicious'
  return 'Neutral'
}

function easterEggLabel(id: string): string {
  return getDialog(`story_easter_egg_${id}`)
}

interface NpcPanelProps {
  game: GameState
}

export function NpcPanel({ game }: NpcPanelProps) {
  const startStoryConversation = useGameStore((s) => s.startStoryConversation)
  const chooseStoryOption = useGameStore((s) => s.chooseStoryOption)
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)

  const npcs = useMemo(() => getStoryNpcsForTown(game.location), [game.location])
  const activeNode = activeNodeId ? getStoryNode(activeNodeId) : null
  const activeNpc = activeNpcId ? getStoryNpcById(activeNpcId) : null
  const options = useMemo(
    () => (activeNodeId ? getVisibleOptions(game, activeNodeId) : []),
    [activeNodeId, game],
  )

  useEffect(() => {
    setActiveNpcId(null)
    setActiveNodeId(null)
  }, [game.location])

  return (
    <section className="npc-panel panel">
      <div className="npc-panel__header">
        <div>
          <h3 className="npc-panel__title">People in town</h3>
          <p className="muted npc-panel__copy">
            Each contact can open different routes, payments, or secrets depending on what you have already done.
          </p>
        </div>
      </div>

      <div className="npc-panel__grid">
        {npcs.map((npc) => {
          const relationship = getNpcRelationship(game, npc.id)
          const summary = getNpcQuestSummary(game, npc.id)
          const isActive = activeNpcId === npc.id
          return (
            <article key={npc.id} className={`npc-card${isActive ? ' npc-card--active' : ''}`}>
              <div className="npc-card__header">
                <div className="npc-card__identity">
                  <NpcPortrait
                    portraitId={npc.portraitId}
                    npcId={npc.id}
                    size="small"
                    title={npc.name}
                  />
                  <div>
                    <h4>{npc.name}</h4>
                    <p className="muted small">{npc.title}</p>
                  </div>
                </div>
                <span className="npc-card__favor">{favorLabel(relationship.favor)}</span>
              </div>
              <p className="npc-card__summary">{getDialog(npc.shortDescriptionKey)}</p>
              <div className="npc-card__meta muted small">
                <span>Favor {relationship.favor >= 0 ? '+' : ''}{relationship.favor}</span>
                <span>Talked {relationship.timesSpokenTo} time{relationship.timesSpokenTo === 1 ? '' : 's'}</span>
                <span>{summary.active.length} active lead{summary.active.length === 1 ? '' : 's'}</span>
              </div>
              <div className="npc-card__actions">
                <button
                  type="button"
                  onClick={() => {
                    const nextNodeId = startStoryConversation(npc.id)
                    setActiveNpcId(npc.id)
                    setActiveNodeId(nextNodeId)
                  }}
                >
                  {isActive ? 'Talk Again' : 'Talk'}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {activeNpc && activeNode ? (
        <div className="npc-dialog">
          <div className="npc-dialog__header">
            <div className="npc-dialog__identity">
              <NpcPortrait
                portraitId={activeNpc.portraitId}
                npcId={activeNpc.id}
                size="large"
                title={activeNpc.name}
              />
              <div>
                <h4>{activeNpc.name}</h4>
                <p className="muted small">{activeNpc.title}</p>
              </div>
            </div>
            <button
              type="button"
              className="ghost small"
              onClick={() => {
                setActiveNpcId(null)
                setActiveNodeId(null)
              }}
            >
              Close
            </button>
          </div>
          <p className="npc-dialog__body">{getDialog(activeNode.textKey)}</p>
          <div className="npc-dialog__options">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className="npc-dialog__option"
                onClick={() => {
                  const nextNodeId = chooseStoryOption(activeNode.id, option.id)
                  setActiveNodeId(nextNodeId)
                  if (!nextNodeId) setActiveNpcId(null)
                }}
              >
                {getDialog(option.textKey)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="npc-dialog npc-dialog--empty">
          <p className="muted">
            Choose someone in town to start a conversation.
          </p>
        </div>
      )}

      <div className="npc-panel__footer">
        <div className="npc-panel__section">
          <h4>Active road stories</h4>
          {game.story.activeQuestIds.length > 0 ? (
            <div className="story-quest-list">
              {game.story.activeQuestIds.map((questId) => {
                const quest = getStoryQuestCard(game, questId)
                if (!quest) return null
                return quest
              })}
            </div>
          ) : (
            <p className="muted small">No active story quests yet. Talk to people to start them.</p>
          )}
        </div>
        <div className="npc-panel__section">
          <h4>Easter eggs</h4>
          {game.story.unlockedEasterEggs.length > 0 ? (
            <ul className="npc-panel__eggs">
              {game.story.unlockedEasterEggs.map((eggId) => (
                <li key={eggId}>{easterEggLabel(eggId)}</li>
              ))}
            </ul>
          ) : (
            <p className="muted small">No secrets uncovered yet.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function getStoryQuestCard(game: GameState, questId: string) {
  const quest = getStoryQuestById(questId)
  if (!quest) return null
  const objectiveStatuses = quest.objectives.map((objective) => getObjectiveStatus(game, objective))
  const nextObjective = objectiveStatuses.find((entry) => !entry.done) ?? objectiveStatuses[0]
  return (
    <article key={quest.id} className="story-quest-card">
      <h5>{getDialog(quest.titleKey)}</h5>
      <p>{getDialog(quest.bodyKey)}</p>
      {nextObjective ? (
        <p className="story-quest-card__objective">
          <strong>Next:</strong> {nextObjective.label}
        </p>
      ) : null}
    </article>
  )
}
