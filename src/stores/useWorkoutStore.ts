import { create } from 'zustand'
import { db } from '@/db'
import type { WorkoutExercise, WorkoutLog } from '@/types'

interface ActiveWorkout {
  workoutId: string
  exercises: WorkoutExercise[]
  currentExerciseIndex: number
  currentSetIndex: number
  startedAt: number
  isPaused: boolean
}

const STORAGE_KEY = 'fp-active-workout'

function saveActive(active: ActiveWorkout | null) {
  if (active) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(active))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function loadActive(): ActiveWorkout | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

interface WorkoutState {
  active: ActiveWorkout | null
  logs: WorkoutLog[]
  startWorkout: (workoutId: string, exercises: WorkoutExercise[]) => void
  completeSet: (reps: number, weight?: number) => void
  skipSet: () => void
  nextExercise: () => void
  togglePause: () => void
  finishWorkout: () => Promise<WorkoutLog | null>
  abandonWorkout: () => void
  loadLogs: () => Promise<void>
  restoreActive: () => void
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  active: null,
  logs: [],

  restoreActive: () => {
    const saved = loadActive()
    if (saved) set({ active: saved })
  },

  startWorkout: (workoutId, exercises) => {
    const deepCopy: WorkoutExercise[] = exercises.map(e => ({
      ...e,
      sets: e.sets.map(s => ({ ...s, completed: false })),
    }))

    const active: ActiveWorkout = {
      workoutId,
      exercises: deepCopy,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      startedAt: Date.now(),
      isPaused: false,
    }

    saveActive(active)
    set({ active })
  },

  completeSet: (reps, weight) => {
    const { active } = get()
    if (!active) return

    const exercises = active.exercises.map((ex, ei) => {
      if (ei !== active.currentExerciseIndex) return ex
      return {
        ...ex,
        sets: ex.sets.map((s, si) => {
          if (si !== active.currentSetIndex) return s
          return { ...s, reps, weight, completed: true }
        }),
      }
    })

    // Find next incomplete set
    let nextExIdx = active.currentExerciseIndex
    let nextSetIdx = active.currentSetIndex + 1

    // Move to next set in current exercise
    if (nextSetIdx >= exercises[nextExIdx].sets.length) {
      // Move to next exercise
      nextSetIdx = 0
      nextExIdx += 1
    }

    // If past all exercises, stay on last position
    if (nextExIdx >= exercises.length) {
      nextExIdx = exercises.length - 1
      nextSetIdx = exercises[nextExIdx].sets.length - 1
    }

    const updated: ActiveWorkout = {
      ...active,
      exercises,
      currentExerciseIndex: nextExIdx,
      currentSetIndex: nextSetIdx,
    }

    saveActive(updated)
    set({ active: updated })
  },

  skipSet: () => {
    const { active } = get()
    if (!active) return

    let nextSetIndex = active.currentSetIndex + 1
    let nextExerciseIndex = active.currentExerciseIndex

    if (nextSetIndex >= active.exercises[active.currentExerciseIndex].sets.length) {
      nextSetIndex = 0
      nextExerciseIndex += 1
    }

    if (nextExerciseIndex >= active.exercises.length) {
      nextExerciseIndex = active.exercises.length - 1
      nextSetIndex = active.exercises[nextExerciseIndex].sets.length - 1
    }

    const updated: ActiveWorkout = {
      ...active,
      currentSetIndex: nextSetIndex,
      currentExerciseIndex: nextExerciseIndex,
    }

    saveActive(updated)
    set({ active: updated })
  },

  nextExercise: () => {
    const { active } = get()
    if (!active) return

    const updated: ActiveWorkout = {
      ...active,
      currentExerciseIndex: Math.min(active.currentExerciseIndex + 1, active.exercises.length - 1),
      currentSetIndex: 0,
    }

    saveActive(updated)
    set({ active: updated })
  },

  togglePause: () => {
    const { active } = get()
    if (!active) return
    const updated = { ...active, isPaused: !active.isPaused }
    saveActive(updated)
    set({ active: updated })
  },

  finishWorkout: async () => {
    const { active } = get()
    if (!active) return null

    const completedSets = active.exercises.reduce(
      (total, ex) => total + ex.sets.filter(s => s.completed).length,
      0,
    )
    const xpEarned = completedSets * 10

    const log: WorkoutLog = {
      id: crypto.randomUUID(),
      workoutId: active.workoutId,
      startedAt: active.startedAt,
      completedAt: Date.now(),
      exercises: active.exercises,
      xpEarned,
    }

    await db.workoutLogs.add(log)
    saveActive(null)
    set({ active: null })
    return log
  },

  abandonWorkout: () => {
    saveActive(null)
    set({ active: null })
  },

  loadLogs: async () => {
    const logs = await db.workoutLogs.orderBy('startedAt').reverse().toArray()
    set({ logs })
  },
}))
