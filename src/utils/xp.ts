const XP_PER_LEVEL = 500

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function getXPForNextLevel(xp: number): number {
  const currentLevel = getLevelFromXP(xp)
  return currentLevel * XP_PER_LEVEL
}

export function getXPProgress(xp: number): number {
  const prevLevelXP = (getLevelFromXP(xp) - 1) * XP_PER_LEVEL
  const nextLevelXP = getXPForNextLevel(xp)
  return (xp - prevLevelXP) / (nextLevelXP - prevLevelXP)
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return xp.toString()
}
