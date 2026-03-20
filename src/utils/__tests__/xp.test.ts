import { describe, it, expect } from 'vitest'
import { getLevelFromXP, getXPForNextLevel, getXPProgress, formatXP } from '../xp'

describe('xp utilities', () => {
  describe('getLevelFromXP', () => {
    it('should return level 1 for 0 XP', () => {
      expect(getLevelFromXP(0)).toBe(1)
    })

    it('should return level 1 for XP below 500', () => {
      expect(getLevelFromXP(499)).toBe(1)
    })

    it('should return level 2 for 500 XP', () => {
      expect(getLevelFromXP(500)).toBe(2)
    })

    it('should return level 3 for 1000 XP', () => {
      expect(getLevelFromXP(1000)).toBe(3)
    })

    it('should return correct level for large XP values', () => {
      expect(getLevelFromXP(4999)).toBe(10)
      expect(getLevelFromXP(5000)).toBe(11)
    })
  })

  describe('getXPForNextLevel', () => {
    it('should return 500 for level 1 (0 XP)', () => {
      expect(getXPForNextLevel(0)).toBe(500)
    })

    it('should return 1000 for level 2 (500 XP)', () => {
      expect(getXPForNextLevel(500)).toBe(1000)
    })

    it('should return correct threshold at mid-level', () => {
      expect(getXPForNextLevel(750)).toBe(1000) // level 2, next level at 1000
    })
  })

  describe('getXPProgress', () => {
    it('should return 0 at the start of a level', () => {
      expect(getXPProgress(0)).toBe(0)
      expect(getXPProgress(500)).toBe(0)
    })

    it('should return 0.5 halfway through a level', () => {
      expect(getXPProgress(250)).toBe(0.5)
    })

    it('should return correct progress at various points', () => {
      // Level 1: 0..499 (range=500)
      expect(getXPProgress(100)).toBeCloseTo(0.2)

      // Level 2: 500..999 (range=500)
      expect(getXPProgress(750)).toBeCloseTo(0.5)
    })
  })

  describe('formatXP', () => {
    it('should return number as string for XP below 1000', () => {
      expect(formatXP(0)).toBe('0')
      expect(formatXP(500)).toBe('500')
      expect(formatXP(999)).toBe('999')
    })

    it('should format with k suffix for XP >= 1000', () => {
      expect(formatXP(1000)).toBe('1.0k')
      expect(formatXP(1500)).toBe('1.5k')
      expect(formatXP(10000)).toBe('10.0k')
    })
  })
})
