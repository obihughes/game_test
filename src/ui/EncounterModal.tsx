import { useGameStore } from '@/store/gameStore.ts'
import type { TravelEncounter } from '@/game/core/types.ts'

interface EncounterModalProps {
  encounter: TravelEncounter
}

export function EncounterModal({ encounter }: EncounterModalProps) {
  const dismissEncounter = useGameStore((s) => s.dismissEncounter)

  return (
    <div className="encounter-backdrop" role="dialog" aria-modal="true" aria-label="Road encounter">
      <div className="encounter-dialog">
        <div className="encounter-dialog__header">
          <span className="encounter-dialog__icon" aria-hidden>🛤️</span>
          <span className="encounter-dialog__title">On the road…</span>
        </div>
        <p className="encounter-dialog__text">{encounter.text}</p>
        {encounter.effectText ? (
          <p className="encounter-dialog__effect">{encounter.effectText}</p>
        ) : null}
        <button
          type="button"
          className="encounter-dialog__btn"
          onClick={dismissEncounter}
          autoFocus
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
