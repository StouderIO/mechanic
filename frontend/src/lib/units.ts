export type UnitLabel = 'kB' | 'MB' | 'GB' | 'TB'

export interface Unit {
  label: UnitLabel
  factor: number
}

export const units: Unit[] = [
  {
    label: 'kB',
    factor: 1_000,
  },
  {
    label: 'MB',
    factor: 1_000_000,
  },
  {
    label: 'GB',
    factor: 1_000_000_000,
  },
  {
    label: 'TB',
    factor: 1_000_000_000_000,
  },
] as const

export function getFactor(label: UnitLabel) {
  const found = units.find((unit) => unit.label === label)
  if (found === undefined) {
    throw new Error(`no factor found for label ${label}`)
  }
  return found.factor
}

export function asBytes(value: number, unit: UnitLabel) {
  return value * getFactor(unit)
}

export function convertBytes(bytes: number | null): {
  value: number
  unit: UnitLabel
} | null {
  if (bytes === null) {
    return null
  }
  if (bytes === 0) {
    return { value: 0, unit: 'kB' }
  }

  const sortedUnits = [...units].sort((a, b) => b.factor - a.factor)

  for (const unit of sortedUnits) {
    if (bytes >= unit.factor) {
      return {
        value: bytes / unit.factor,
        unit: unit.label,
      }
    }
  }

  return {
    value: bytes / getFactor('kB'),
    unit: 'kB',
  }
}
