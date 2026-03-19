import Dexie, { type EntityTable } from 'dexie'
import type { Exercise, Workout, WorkoutLog, UserProfile, Achievement, DailyChallenge } from '@/types'

class FitPulseDB extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  workoutLogs!: EntityTable<WorkoutLog, 'id'>
  userProfile!: EntityTable<UserProfile, 'id'>
  achievements!: EntityTable<Achievement, 'id'>
  dailyChallenges!: EntityTable<DailyChallenge, 'id'>

  constructor() {
    super('FitPulseDB')

    this.version(1).stores({
      exercises: 'id, *muscleGroups, difficulty',
      workouts: 'id, difficulty, createdAt',
      workoutLogs: 'id, workoutId, startedAt, completedAt',
      userProfile: 'id',
      achievements: 'id, unlockedAt',
      dailyChallenges: 'id, date, completed',
    })
  }
}

export const db = new FitPulseDB()
