import type { HireRole } from '../core/types.ts'

export const HIRE_COST: Record<HireRole, number> = {
  guard: 40,
  scout: 55,
}

export const HIRE_UPKEEP_PER_DAY: Record<HireRole, number> = {
  guard: 1,
  scout: 2,
}

export const HIRE_LABEL: Record<HireRole, string> = {
  guard: 'Guard',
  scout: 'Scout',
}