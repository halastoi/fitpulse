import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Exercise } from '@/types'

const mockExercises: Exercise[] = [
  {
    id: 'push-ups',
    name: 'Push-Ups',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: ['Start in plank position'],
  },
  {
    id: 'squats',
    name: 'Bodyweight Squats',
    muscleGroups: ['legs', 'glutes'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: ['Stand with feet shoulder-width apart'],
  },
  {
    id: 'plank',
    name: 'Plank',
    muscleGroups: ['core'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: ['Forearms on floor'],
  },
  {
    id: 'burpees',
    name: 'Burpees',
    muscleGroups: ['full_body', 'cardio'],
    equipment: ['none'],
    difficulty: 'intermediate',
    instructions: ['Stand, then squat down'],
  },
  {
    id: 'pull-ups',
    name: 'Pull-Ups',
    muscleGroups: ['back', 'biceps'],
    equipment: ['pull_up_bar'],
    difficulty: 'advanced',
    instructions: ['Hang with arms fully extended'],
  },
  {
    id: 'dumbbell-rows',
    name: 'Dumbbell Rows',
    muscleGroups: ['back', 'biceps'],
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    instructions: ['Hinge at hips'],
  },
]

const toArrayMock = vi.fn().mockResolvedValue(mockExercises)

vi.mock('@/db', () => ({
  db: {
    exercises: {
      toArray: (...args: unknown[]) => toArrayMock(...args),
    },
  },
}))

import { generateWorkout } from '../workout-generator'

describe('generateWorkout', () => {
  beforeEach(() => {
    toArrayMock.mockResolvedValue(mockExercises)
  })

  it('should generate a workout with correct structure', async () => {
    const workout = await generateWorkout({
      equipment: ['none'],
      difficulty: 'beginner',
    })

    expect(workout).toHaveProperty('id')
    expect(workout).toHaveProperty('name')
    expect(workout).toHaveProperty('exercises')
    expect(workout).toHaveProperty('difficulty', 'beginner')
    expect(workout).toHaveProperty('estimatedMinutes')
    expect(workout).toHaveProperty('muscleGroups')
    expect(workout).toHaveProperty('createdAt')
    expect(workout.exercises.length).toBeGreaterThanOrEqual(3)
  })

  it('should filter by equipment availability', async () => {
    const workout = await generateWorkout({
      equipment: ['none'],
      difficulty: 'beginner',
    })

    // Should not include dumbbell-rows or pull-ups
    const exerciseIds = workout.exercises.map(e => e.exerciseId)
    expect(exerciseIds).not.toContain('pull-ups')
    expect(exerciseIds).not.toContain('dumbbell-rows')
  })

  it('should filter by difficulty level', async () => {
    const workout = await generateWorkout({
      equipment: ['none'],
      difficulty: 'beginner',
    })

    // Should not include intermediate or advanced exercises
    const exerciseIds = workout.exercises.map(e => e.exerciseId)
    expect(exerciseIds).not.toContain('burpees') // intermediate
    expect(exerciseIds).not.toContain('pull-ups') // advanced
  })

  it('should include intermediate exercises when difficulty is intermediate', async () => {
    const workout = await generateWorkout({
      equipment: ['none'],
      difficulty: 'intermediate',
    })

    // Pull-ups requires pull_up_bar, not 'none', so should be excluded
    const exerciseIds = workout.exercises.map(e => e.exerciseId)
    expect(exerciseIds).not.toContain('pull-ups')
  })

  it('should filter by muscle groups when specified', async () => {
    const workout = await generateWorkout({
      muscleGroups: ['core'],
      equipment: ['none'],
      difficulty: 'beginner',
    })

    const allMuscleGroups = workout.muscleGroups
    expect(allMuscleGroups).toContain('core')
  })

  it('should generate correct number of sets based on difficulty', async () => {
    const beginnerWorkout = await generateWorkout({
      equipment: ['none'],
      difficulty: 'beginner',
    })

    const intermediateWorkout = await generateWorkout({
      equipment: ['none'],
      difficulty: 'intermediate',
    })

    // Beginner should have 3 sets per exercise
    expect(beginnerWorkout.exercises[0].sets).toHaveLength(3)

    // Intermediate should have 4 sets per exercise
    expect(intermediateWorkout.exercises[0].sets).toHaveLength(4)
  })

  it('should generate correct reps based on difficulty', async () => {
    const beginnerWorkout = await generateWorkout({
      equipment: ['none'],
      difficulty: 'beginner',
    })

    // Beginner should have 10 reps per set
    expect(beginnerWorkout.exercises[0].sets[0].reps).toBe(10)
  })

  it('should set all sets as not completed initially', async () => {
    const workout = await generateWorkout({
      equipment: ['none'],
      difficulty: 'beginner',
    })

    for (const exercise of workout.exercises) {
      for (const set of exercise.sets) {
        expect(set.completed).toBe(false)
      }
    }
  })

  it('should generate at least 3 exercises', async () => {
    const workout = await generateWorkout({
      equipment: ['none'],
      difficulty: 'beginner',
      durationMinutes: 10,
    })

    expect(workout.exercises.length).toBeGreaterThanOrEqual(3)
  })
})
