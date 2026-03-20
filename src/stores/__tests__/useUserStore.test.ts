import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUserStore } from '../useUserStore'
import type { UserProfile } from '@/types'

const mockProfile: UserProfile = {
  id: 'default',
  name: 'TestUser',
  level: 1,
  xp: 0,
  streak: 0,
  equipment: ['none'],
  difficulty: 'beginner',
  createdAt: Date.now(),
}

vi.mock('@/db', () => ({
  db: {
    userProfile: {
      get: vi.fn().mockResolvedValue({
        id: 'default',
        name: 'TestUser',
        level: 1,
        xp: 0,
        streak: 0,
        equipment: ['none'],
        difficulty: 'beginner',
        createdAt: Date.now(),
      }),
      put: vi.fn().mockResolvedValue(undefined),
    },
  },
}))

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      profile: { ...mockProfile },
      loading: false,
    })
  })

  describe('addXP', () => {
    it('should add XP to the user profile', async () => {
      await useUserStore.getState().addXP(100)

      const { profile } = useUserStore.getState()
      expect(profile!.xp).toBe(100)
    })

    it('should calculate level correctly based on XP', async () => {
      // XP_PER_LEVEL = 500; level = floor(xp/500) + 1
      await useUserStore.getState().addXP(500)

      const { profile } = useUserStore.getState()
      expect(profile!.xp).toBe(500)
      expect(profile!.level).toBe(2)
    })

    it('should accumulate XP across multiple calls', async () => {
      await useUserStore.getState().addXP(200)
      await useUserStore.getState().addXP(350)

      const { profile } = useUserStore.getState()
      expect(profile!.xp).toBe(550)
      expect(profile!.level).toBe(2)
    })

    it('should do nothing if profile is null', async () => {
      useUserStore.setState({ profile: null })
      await useUserStore.getState().addXP(100)
      expect(useUserStore.getState().profile).toBeNull()
    })
  })

  describe('updateStreak', () => {
    it('should set streak to 1 if no previous workout date', async () => {
      useUserStore.setState({
        profile: { ...mockProfile, streak: 0, lastWorkoutDate: undefined },
      })

      await useUserStore.getState().updateStreak()

      const { profile } = useUserStore.getState()
      expect(profile!.streak).toBe(1)
      expect(profile!.lastWorkoutDate).toBe(new Date().toISOString().split('T')[0])
    })

    it('should increment streak if last workout was yesterday', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      useUserStore.setState({
        profile: { ...mockProfile, streak: 5, lastWorkoutDate: yesterday },
      })

      await useUserStore.getState().updateStreak()

      const { profile } = useUserStore.getState()
      expect(profile!.streak).toBe(6)
    })

    it('should reset streak to 1 if last workout was more than a day ago', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
      useUserStore.setState({
        profile: { ...mockProfile, streak: 10, lastWorkoutDate: twoDaysAgo },
      })

      await useUserStore.getState().updateStreak()

      const { profile } = useUserStore.getState()
      expect(profile!.streak).toBe(1)
    })

    it('should not change streak if workout already done today', async () => {
      const today = new Date().toISOString().split('T')[0]
      useUserStore.setState({
        profile: { ...mockProfile, streak: 3, lastWorkoutDate: today },
      })

      await useUserStore.getState().updateStreak()

      const { profile } = useUserStore.getState()
      expect(profile!.streak).toBe(3)
    })

    it('should do nothing if profile is null', async () => {
      useUserStore.setState({ profile: null })
      await useUserStore.getState().updateStreak()
      expect(useUserStore.getState().profile).toBeNull()
    })
  })

  describe('load', () => {
    it('should load profile from database', async () => {
      useUserStore.setState({ profile: null, loading: true })

      await useUserStore.getState().load()

      const { profile, loading } = useUserStore.getState()
      expect(loading).toBe(false)
      expect(profile).not.toBeNull()
      expect(profile!.name).toBe('TestUser')
    })
  })
})
