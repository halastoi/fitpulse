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
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  active: null,
  logs: [],

  startWorkout: (workoutId, exercises) => {
    const deepCopy: WorkoutExercise[] = exercises.map(e => ({
      ...e,
      sets: e.sets.map(s => ({ ...s, completed: false })),
    }))

    set({
      active: {
        workoutId,
        exercises: deepCopy,
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        startedAt: Date.now(),
        isPaused: false,
      },
    })
  },

  completeSet: (reps, weight) => {
    const { active } = get()
    if (!active) return

    const exercises = [...active.exercises]
    const exercise = { ...exercises[active.currentExerciseIndex] }
    const sets = [...exercise.sets]
    sets[active.currentSetIndex] = { ...sets[active.currentSetIndex], reps, weight, completed: true }
    exercise.sets = sets
    exercises[active.currentExerciseIndex] = exercise

    let nextSetIndex = active.currentSetIndex + 1
    let nextExerciseIndex = active.currentExerciseIndex

    if (nextSetIndex >= sets.length) {
      nextSetIndex = 0
      nextExerciseIndex = active.currentExerciseIndex + 1
    }

    set({
      active: {
        ...active,
        exercises,
        currentSetIndex: nextSetIndex,
        currentExerciseIndex: Math.min(nextExerciseIndex, exercises.length - 1),
      },
    })
  },

  skipSet: () => {
    const { active } = get()
    if (!active) return

    let nextSetIndex = active.currentSetIndex + 1
    let nextExerciseIndex = active.currentExerciseIndex

    if (nextSetIndex >= active.exercises[active.currentExerciseIndex].sets.length) {
      nextSetIndex = 0
      nextExerciseIndex = active.currentExerciseIndex + 1
    }

    set({
      active: {
        ...active,
        currentSetIndex: nextSetIndex,
        currentExerciseIndex: Math.min(nextExerciseIndex, active.exercises.length - 1),
      },
    })
  },

  nextExercise: () => {
    const { active } = get()
    if (!active) return

    set({
      active: {
        ...active,
        currentExerciseIndex: Math.min(active.currentExerciseIndex + 1, active.exercises.length - 1),
        currentSetIndex: 0,
      },
    })
  },

  togglePause: () => {
    const { active } = get()
    if (!active) return
    set({ active: { ...active, isPaused: !active.isPaused } })
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
    set({ active: null })
    return log
  },

  abandonWorkout: () => {
    set({ active: null })
  },

  loadLogs: async () => {
    const logs = await db.workoutLogs.orderBy('startedAt').reverse().toArray()
    set({ logs })
  },
}))
