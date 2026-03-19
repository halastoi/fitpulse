import { db } from './index'
import type { Exercise, Achievement, UserProfile } from '@/types'

const defaultExercises: Exercise[] = [
  {
    id: 'push-ups',
    name: 'Push-Ups',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: ['Start in plank position', 'Lower chest to floor', 'Push back up to start'],
  },
  {
    id: 'squats',
    name: 'Bodyweight Squats',
    muscleGroups: ['legs', 'glutes'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: ['Stand with feet shoulder-width apart', 'Lower hips back and down', 'Return to standing'],
  },
  {
    id: 'plank',
    name: 'Plank',
    muscleGroups: ['core'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: ['Forearms on floor, elbows under shoulders', 'Body in straight line', 'Hold position'],
  },
  {
    id: 'lunges',
    name: 'Lunges',
    muscleGroups: ['legs', 'glutes'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: ['Step forward with one leg', 'Lower back knee toward floor', 'Push back to start'],
  },
  {
    id: 'burpees',
    name: 'Burpees',
    muscleGroups: ['full_body', 'cardio'],
    equipment: ['none'],
    difficulty: 'intermediate',
    instructions: ['Stand, then squat down', 'Jump feet back to plank', 'Do a push-up', 'Jump feet forward', 'Jump up with arms overhead'],
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    muscleGroups: ['core', 'cardio'],
    equipment: ['none'],
    difficulty: 'intermediate',
    instructions: ['Start in plank position', 'Drive one knee toward chest', 'Alternate legs rapidly'],
  },
  {
    id: 'dumbbell-rows',
    name: 'Dumbbell Rows',
    muscleGroups: ['back', 'biceps'],
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    instructions: ['Hinge at hips, flat back', 'Pull dumbbell to hip', 'Lower with control'],
  },
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    muscleGroups: ['shoulders', 'triceps'],
    equipment: ['dumbbells'],
    difficulty: 'intermediate',
    instructions: ['Hold dumbbells at shoulder height', 'Press overhead until arms locked', 'Lower with control'],
  },
  {
    id: 'pull-ups',
    name: 'Pull-Ups',
    muscleGroups: ['back', 'biceps'],
    equipment: ['pull_up_bar'],
    difficulty: 'advanced',
    instructions: ['Hang with arms fully extended', 'Pull chin above bar', 'Lower with control'],
  },
  {
    id: 'deadlifts',
    name: 'Barbell Deadlifts',
    muscleGroups: ['back', 'legs', 'glutes'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    instructions: ['Stand behind barbell, feet hip-width', 'Hinge and grip bar', 'Drive through heels to stand', 'Lower with control'],
  },
  {
    id: 'bicycle-crunches',
    name: 'Bicycle Crunches',
    muscleGroups: ['core'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: ['Lie on back, hands behind head', 'Bring opposite elbow to knee', 'Alternate sides in pedaling motion'],
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    muscleGroups: ['cardio', 'full_body'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: ['Stand with feet together, arms at sides', 'Jump feet apart while raising arms', 'Jump back to start'],
  },
]

const defaultAchievements: Achievement[] = [
  { id: 'first-workout', name: 'First Step', description: 'Complete your first workout', icon: '🏃', xpReward: 50, condition: { type: 'workouts_completed', value: 1 } },
  { id: '7-day-streak', name: 'Week Warrior', description: '7-day workout streak', icon: '🔥', xpReward: 200, condition: { type: 'streak', value: 7 } },
  { id: '30-day-streak', name: 'Iron Will', description: '30-day workout streak', icon: '💎', xpReward: 1000, condition: { type: 'streak', value: 30 } },
  { id: '10-workouts', name: 'Getting Serious', description: 'Complete 10 workouts', icon: '💪', xpReward: 150, condition: { type: 'workouts_completed', value: 10 } },
  { id: '50-workouts', name: 'Dedicated', description: 'Complete 50 workouts', icon: '🏆', xpReward: 500, condition: { type: 'workouts_completed', value: 50 } },
  { id: '100-workouts', name: 'Century Club', description: 'Complete 100 workouts', icon: '👑', xpReward: 1000, condition: { type: 'workouts_completed', value: 100 } },
  { id: 'xp-1000', name: 'Rising Star', description: 'Earn 1,000 XP', icon: '⭐', xpReward: 100, condition: { type: 'xp_total', value: 1000 } },
  { id: 'xp-10000', name: 'Legend', description: 'Earn 10,000 XP', icon: '🌟', xpReward: 500, condition: { type: 'xp_total', value: 10000 } },
]

export async function seedDatabase() {
  const exerciseCount = await db.exercises.count()
  if (exerciseCount === 0) {
    await db.exercises.bulkAdd(defaultExercises)
  }

  const achievementCount = await db.achievements.count()
  if (achievementCount === 0) {
    await db.achievements.bulkAdd(defaultAchievements)
  }

  const profileCount = await db.userProfile.count()
  if (profileCount === 0) {
    const profile: UserProfile = {
      id: 'default',
      name: 'Athlete',
      level: 1,
      xp: 0,
      streak: 0,
      equipment: ['none'],
      difficulty: 'beginner',
      createdAt: Date.now(),
    }
    await db.userProfile.add(profile)
  }
}
