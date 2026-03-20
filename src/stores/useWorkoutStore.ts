import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from '@/db'
import type { WorkoutExercise, WorkoutLog } from '@/types'

export interface ActiveWorkout {
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

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      active: null,
      logs: [],

      startWorkout: (workoutId, exercises) => {
        // Guard: do not overwrite an existing active workout
        const { active } = get()
        if (active) return

        const deepCopy: WorkoutExercise[] = exercises.map(e => ({
          ...e,
          sets: e.sets.map(s => ({ ...s, completed: false })),
        }))

        const newActive: ActiveWorkout = {
          workoutId,
          exercises: deepCopy,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          startedAt: Date.now(),
          isPaused: false,
        }

        set({ active: newActive })
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

        set({ active: updated })
      },

      togglePause: () => {
        const { active } = get()
        if (!active) return
        const updated = { ...active, isPaused: !active.isPaused }
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
    }),
    {
      name: 'fp-active-workout',
      partialize: (state) => ({ active: state.active }),
    },
  ),
)
