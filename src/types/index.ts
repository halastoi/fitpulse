export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'full_body'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type Equipment = string

export interface Exercise {
  id: string
  name: string
  muscleGroups: MuscleGroup[]
  equipment: Equipment[]
  difficulty: Difficulty
  instructions: string[]
  imageUrl?: string
}

export interface WorkoutSet {
  reps: number
  weight?: number
  duration?: number
  completed: boolean
}

export interface WorkoutExercise {
  exerciseId: string
  sets: WorkoutSet[]
  restSeconds: number
}

export interface Workout {
  id: string
  name: string
  exercises: WorkoutExercise[]
  difficulty: Difficulty
  estimatedMinutes: number
  muscleGroups: MuscleGroup[]
  createdAt: number
}

export interface WorkoutLog {
  id: string
  workoutId: string
  startedAt: number
  completedAt?: number
  exercises: WorkoutExercise[]
  xpEarned: number
}

export interface UserProfile {
  id: string
  name: string
  level: number
  xp: number
  streak: number
  lastWorkoutDate?: string
  equipment: Equipment[]
  difficulty: Difficulty
  createdAt: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  unlockedAt?: number
  condition: {
    type: 'workouts_completed' | 'streak' | 'xp_total' | 'exercise_pr'
    value: number
  }
}

export interface DailyChallenge {
  id: string
  date: string
  exercise: string
  target: number
  unit: 'reps' | 'seconds'
  xpReward: number
  completed: boolean
}
