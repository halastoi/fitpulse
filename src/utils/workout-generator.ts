import { db } from '@/db'
import type { Exercise, Workout, WorkoutExercise, MuscleGroup, Equipment, Difficulty } from '@/types'

interface GenerateOptions {
  muscleGroups?: MuscleGroup[]
  equipment: Equipment[]
  difficulty: Difficulty
  durationMinutes?: number
}

const SETS_BY_DIFFICULTY: Record<Difficulty, number> = {
  beginner: 3,
  intermediate: 4,
  advanced: 5,
}

const REPS_BY_DIFFICULTY: Record<Difficulty, number> = {
  beginner: 10,
  intermediate: 12,
  advanced: 15,
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function generateWorkout(options: GenerateOptions): Promise<Workout> {
  const { muscleGroups, equipment, difficulty, durationMinutes = 30 } = options

  let exercises = await db.exercises.toArray()

  // Filter by equipment availability
  exercises = exercises.filter(ex =>
    ex.equipment.some(eq => equipment.includes(eq)),
  )

  // Filter by difficulty
  const difficultyOrder: Difficulty[] = ['beginner', 'intermediate', 'advanced']
  const maxDiffIndex = difficultyOrder.indexOf(difficulty)
  exercises = exercises.filter(ex =>
    difficultyOrder.indexOf(ex.difficulty) <= maxDiffIndex,
  )

  // Filter by muscle groups if specified
  if (muscleGroups && muscleGroups.length > 0) {
    exercises = exercises.filter(ex =>
      ex.muscleGroups.some(mg => muscleGroups.includes(mg)),
    )
  }

  // Shuffle and pick exercises based on duration
  const exercisesPerWorkout = Math.min(Math.floor(durationMinutes / 5), exercises.length)
  const selected = shuffleArray(exercises).slice(0, Math.max(exercisesPerWorkout, 3))

  const numSets = SETS_BY_DIFFICULTY[difficulty]
  const numReps = REPS_BY_DIFFICULTY[difficulty]

  const workoutExercises: WorkoutExercise[] = selected.map(ex => ({
    exerciseId: ex.id,
    sets: Array.from({ length: numSets }, () => ({
      reps: numReps,
      completed: false,
    })),
    restSeconds: difficulty === 'beginner' ? 60 : difficulty === 'intermediate' ? 45 : 30,
  }))

  const allMuscleGroups = [...new Set(selected.flatMap(ex => ex.muscleGroups))]

  return {
    id: crypto.randomUUID(),
    name: generateWorkoutName(allMuscleGroups),
    exercises: workoutExercises,
    difficulty,
    estimatedMinutes: durationMinutes,
    muscleGroups: allMuscleGroups,
    createdAt: Date.now(),
  }
}

function generateWorkoutName(muscleGroups: MuscleGroup[]): string {
  if (muscleGroups.includes('full_body') || muscleGroups.length >= 4) return 'Full Body Blast'
  if (muscleGroups.includes('chest') && muscleGroups.includes('triceps')) return 'Push Day'
  if (muscleGroups.includes('back') && muscleGroups.includes('biceps')) return 'Pull Day'
  if (muscleGroups.includes('legs') || muscleGroups.includes('glutes')) return 'Leg Day'
  if (muscleGroups.includes('core')) return 'Core Crusher'
  if (muscleGroups.includes('cardio')) return 'Cardio Burn'
  if (muscleGroups.includes('shoulders')) return 'Shoulder Sculpt'
  return 'Custom Workout'
}

export function getExerciseById(exercises: Exercise[], id: string): Exercise | undefined {
  return exercises.find(ex => ex.id === id)
}
