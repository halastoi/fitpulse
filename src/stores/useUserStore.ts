import { create } from 'zustand'
import { db } from '@/db'
import type { UserProfile, Equipment, Difficulty } from '@/types'

const XP_PER_LEVEL = 500

interface UserState {
  profile: UserProfile | null
  loading: boolean
  load: () => Promise<void>
  addXP: (amount: number) => Promise<void>
  updateStreak: () => Promise<void>
  updateEquipment: (equipment: Equipment[]) => Promise<void>
  updateDifficulty: (difficulty: Difficulty) => Promise<void>
  updateName: (name: string) => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  loading: true,

  load: async () => {
    const profile = await db.userProfile.get('default')
    set({ profile: profile ?? null, loading: false })
  },

  addXP: async (amount: number) => {
    const { profile } = get()
    if (!profile) return

    const newXP = profile.xp + amount
    const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1
    const updated = { ...profile, xp: newXP, level: newLevel }

    await db.userProfile.put(updated)
    set({ profile: updated })
  },

  updateStreak: async () => {
    const { profile } = get()
    if (!profile) return

    const today = new Date().toISOString().split('T')[0]

    if (profile.lastWorkoutDate === today) return

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const newStreak = profile.lastWorkoutDate === yesterday ? profile.streak + 1 : 1
    const updated = { ...profile, streak: newStreak, lastWorkoutDate: today }

    await db.userProfile.put(updated)
    set({ profile: updated })
  },

  updateEquipment: async (equipment: Equipment[]) => {
    const { profile } = get()
    if (!profile) return

    const updated = { ...profile, equipment }
    await db.userProfile.put(updated)
    set({ profile: updated })
  },

  updateDifficulty: async (difficulty: Difficulty) => {
    const { profile } = get()
    if (!profile) return

    const updated = { ...profile, difficulty }
    await db.userProfile.put(updated)
    set({ profile: updated })
  },

  updateName: async (name: string) => {
    const { profile } = get()
    if (!profile) return

    const updated = { ...profile, name }
    await db.userProfile.put(updated)
    set({ profile: updated })
  },
}))
