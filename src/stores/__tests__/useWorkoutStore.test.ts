import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWorkoutStore, type ActiveWorkout } from '../useWorkoutStore'
import type { WorkoutExercise } from '@/types'

// Mock Dexie database
vi.mock('@/db', () => ({
  db: {
    workoutLogs: {
      add: vi.fn().mockResolvedValue(undefined),
      orderBy: vi.fn().mockReturnValue({
        reverse: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
  },
}))

function makeSampleExercises(count = 2, setsPerExercise = 3): WorkoutExercise[] {
  return Array.from({ length: count }, (_, i) => ({
    exerciseId: `exercise-${i}`,
    sets: Array.from({ length: setsPerExercise }, () => ({
      reps: 10,
      completed: false,
    })),
    restSeconds: 45,
  }))
}

function clearStorage() {
  try {
    // Try standard API first
    if (typeof localStorage !== 'undefined' && typeof localStorage.clear === 'function') {
      localStorage.clear()
    } else if (typeof window !== 'undefined' && window.localStorage) {
      // Manually remove our key
      window.localStorage.removeItem('fp-active-workout')
    }
  } catch {
    // Fallback: remove the specific key used by the store
    try {
      localStorage.removeItem('fp-active-workout')
    } catch {
      // Storage not available in test env
    }
  }
}

function getStoredState(): { state: { active: unknown } } | null {
  try {
    const raw = localStorage.getItem('fp-active-workout')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

describe('useWorkoutStore', () => {
  beforeEach(() => {
    // Clear persisted state and reset the store
    clearStorage()
    useWorkoutStore.setState({ active: null, logs: [] })
  })

  describe('startWorkout', () => {
    it('should create an active workout with correct initial state', () => {
      const exercises = makeSampleExercises()
      useWorkoutStore.getState().startWorkout('workout-1', exercises)

      const { active } = useWorkoutStore.getState()
      expect(active).not.toBeNull()
      expect(active!.workoutId).toBe('workout-1')
      expect(active!.exercises).toHaveLength(2)
      expect(active!.currentExerciseIndex).toBe(0)
      expect(active!.currentSetIndex).toBe(0)
      expect(active!.isPaused).toBe(false)
      expect(active!.startedAt).toBeGreaterThan(0)
    })

    it('should deep copy exercises and reset completed flags', () => {
      const exercises: WorkoutExercise[] = [{
        exerciseId: 'ex-1',
        sets: [
          { reps: 10, completed: true },
          { reps: 12, completed: true },
        ],
        restSeconds: 45,
      }]

      useWorkoutStore.getState().startWorkout('workout-1', exercises)

      const { active } = useWorkoutStore.getState()
      expect(active!.exercises[0].sets[0].completed).toBe(false)
      expect(active!.exercises[0].sets[1].completed).toBe(false)

      // Verify it's a deep copy - mutating original shouldn't affect store
      exercises[0].sets[0].reps = 999
      expect(active!.exercises[0].sets[0].reps).toBe(10)
    })

    it('should NOT overwrite an existing active workout', () => {
      const exercises1 = makeSampleExercises()
      const exercises2: WorkoutExercise[] = [{
        exerciseId: 'different-exercise',
        sets: [{ reps: 5, completed: false }],
        restSeconds: 30,
      }]

      useWorkoutStore.getState().startWorkout('workout-1', exercises1)
      useWorkoutStore.getState().startWorkout('workout-2', exercises2)

      const { active } = useWorkoutStore.getState()
      expect(active!.workoutId).toBe('workout-1')
      expect(active!.exercises).toHaveLength(2)
    })
  })

  describe('completeSet', () => {
    it('should mark the current set as completed and advance', () => {
      const exercises = makeSampleExercises(1, 3)
      useWorkoutStore.getState().startWorkout('w-1', exercises)

      useWorkoutStore.getState().completeSet(10, 50)

      const { active } = useWorkoutStore.getState()
      expect(active!.exercises[0].sets[0].completed).toBe(true)
      expect(active!.exercises[0].sets[0].reps).toBe(10)
      expect(active!.exercises[0].sets[0].weight).toBe(50)
      expect(active!.currentSetIndex).toBe(1)
      expect(active!.currentExerciseIndex).toBe(0)
    })

    it('should advance to next exercise when all sets of current exercise are done', () => {
      const exercises = makeSampleExercises(2, 2)
      useWorkoutStore.getState().startWorkout('w-1', exercises)

      // Complete both sets of first exercise
      useWorkoutStore.getState().completeSet(10)
      useWorkoutStore.getState().completeSet(10)

      const { active } = useWorkoutStore.getState()
      expect(active!.currentExerciseIndex).toBe(1)
      expect(active!.currentSetIndex).toBe(0)
    })

    it('should stay on last position when all sets of all exercises are done', () => {
      const exercises = makeSampleExercises(1, 2)
      useWorkoutStore.getState().startWorkout('w-1', exercises)

      useWorkoutStore.getState().completeSet(10)
      useWorkoutStore.getState().completeSet(10)

      const { active } = useWorkoutStore.getState()
      // Should stay at last position
      expect(active!.currentExerciseIndex).toBe(0)
      expect(active!.currentSetIndex).toBe(1)
      // All sets completed
      expect(active!.exercises[0].sets.every(s => s.completed)).toBe(true)
    })

    it('should do nothing if no active workout', () => {
      useWorkoutStore.getState().completeSet(10)
      expect(useWorkoutStore.getState().active).toBeNull()
    })
  })

  describe('skipSet', () => {
    it('should advance set index without marking complete', () => {
      const exercises = makeSampleExercises(1, 3)
      useWorkoutStore.getState().startWorkout('w-1', exercises)

      useWorkoutStore.getState().skipSet()

      const { active } = useWorkoutStore.getState()
      expect(active!.currentSetIndex).toBe(1)
      expect(active!.exercises[0].sets[0].completed).toBe(false)
    })
  })

  describe('togglePause', () => {
    it('should toggle isPaused', () => {
      useWorkoutStore.getState().startWorkout('w-1', makeSampleExercises())

      useWorkoutStore.getState().togglePause()
      expect(useWorkoutStore.getState().active!.isPaused).toBe(true)

      useWorkoutStore.getState().togglePause()
      expect(useWorkoutStore.getState().active!.isPaused).toBe(false)
    })
  })

  describe('finishWorkout', () => {
    it('should create a workout log with correct XP and clear active state', async () => {
      const exercises = makeSampleExercises(1, 3)
      useWorkoutStore.getState().startWorkout('w-1', exercises)

      // Complete 2 out of 3 sets
      useWorkoutStore.getState().completeSet(10, 50)
      useWorkoutStore.getState().completeSet(12, 55)

      const log = await useWorkoutStore.getState().finishWorkout()

      expect(log).not.toBeNull()
      expect(log!.workoutId).toBe('w-1')
      expect(log!.xpEarned).toBe(20) // 2 completed sets * 10 XP each
      expect(log!.completedAt).toBeGreaterThan(0)
      expect(log!.exercises[0].sets.filter(s => s.completed)).toHaveLength(2)

      // Active should be cleared
      expect(useWorkoutStore.getState().active).toBeNull()
    })

    it('should return null if no active workout', async () => {
      const log = await useWorkoutStore.getState().finishWorkout()
      expect(log).toBeNull()
    })
  })

  describe('abandonWorkout', () => {
    it('should clear active workout', () => {
      useWorkoutStore.getState().startWorkout('w-1', makeSampleExercises())
      expect(useWorkoutStore.getState().active).not.toBeNull()

      useWorkoutStore.getState().abandonWorkout()
      expect(useWorkoutStore.getState().active).toBeNull()
    })
  })

  describe('persistence across page reloads', () => {
    it('should persist active workout to localStorage', () => {
      const exercises = makeSampleExercises(1, 2)
      useWorkoutStore.getState().startWorkout('w-1', exercises)

      const stored = getStoredState()
      expect(stored).not.toBeNull()
      expect(stored!.state.active).not.toBeNull()
      expect((stored!.state.active as { workoutId: string }).workoutId).toBe('w-1')
    })

    it('should persist completed sets after completeSet', () => {
      useWorkoutStore.getState().startWorkout('w-1', makeSampleExercises(1, 2))
      useWorkoutStore.getState().completeSet(10, 50)

      const stored = getStoredState()
      expect(stored).not.toBeNull()
      const active = stored!.state.active as ActiveWorkout
      expect(active.exercises[0].sets[0].completed).toBe(true)
      expect(active.exercises[0].sets[0].reps).toBe(10)
      expect(active.exercises[0].sets[0].weight).toBe(50)
    })

    it('should restore active workout from localStorage on store re-creation', async () => {
      // Start a workout and complete a set
      useWorkoutStore.getState().startWorkout('w-persist', makeSampleExercises(1, 3))
      useWorkoutStore.getState().completeSet(12, 60)

      const persistedData = getStoredState()
      expect(persistedData).not.toBeNull()

      // Verify the data is in localStorage before clearing in-memory state
      const rawBefore = localStorage.getItem('fp-active-workout')
      expect(rawBefore).not.toBeNull()

      // Simulate a "reload": manually parse localStorage and set state
      // This mirrors what happens when the module is re-loaded on page refresh:
      // the persist middleware reads localStorage and merges into initial state
      const parsed = JSON.parse(rawBefore!)
      useWorkoutStore.setState({ active: null, logs: [] })

      // Apply the persisted state directly (simulating what persist middleware does on init)
      useWorkoutStore.setState(parsed.state)

      const { active } = useWorkoutStore.getState()
      expect(active).not.toBeNull()
      expect(active!.workoutId).toBe('w-persist')
      expect(active!.exercises[0].sets[0].completed).toBe(true)
      expect(active!.exercises[0].sets[0].reps).toBe(12)
      expect(active!.currentSetIndex).toBe(1)
    })

    it('should clear localStorage when workout is finished', async () => {
      useWorkoutStore.getState().startWorkout('w-1', makeSampleExercises(1, 1))
      useWorkoutStore.getState().completeSet(10)

      await useWorkoutStore.getState().finishWorkout()

      const stored = getStoredState()
      expect(stored).not.toBeNull()
      expect(stored!.state.active).toBeNull()
    })

    it('should clear localStorage when workout is abandoned', () => {
      useWorkoutStore.getState().startWorkout('w-1', makeSampleExercises())
      useWorkoutStore.getState().abandonWorkout()

      const stored = getStoredState()
      expect(stored).not.toBeNull()
      expect(stored!.state.active).toBeNull()
    })
  })
})
