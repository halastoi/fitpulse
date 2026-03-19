import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useUserStore } from '@/stores/useUserStore'
import { generateWorkout } from '@/utils/workout-generator'
import { useI18n } from '@/i18n/useI18n'
import { XPBar } from '@/components/ui/XPBar'
import { StreakBadge } from '@/components/ui/StreakBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Workout } from '@/types'

export function HomePage() {
  const { profile, loading, load } = useUserStore()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    load()
  }, [load])

  const handleGenerateWorkout = async () => {
    if (!profile) return
    setGenerating(true)
    const workout = await generateWorkout({
      equipment: profile.equipment,
      difficulty: profile.difficulty,
    })
    setTodayWorkout(workout)
    setGenerating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <div className="animate-pulse text-primary-400 text-lg">{t('loading')}</div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {t('home_greeting', { name: profile.name })}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('home_subtitle')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <div className="flex-1">
          <XPBar xp={profile.xp} level={profile.level} />
        </div>
        <StreakBadge streak={profile.streak} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card glow className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('home_today')}</h2>
          </div>

          {todayWorkout ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-primary-400">{todayWorkout.name}</h3>
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                  {t('home_min', { min: todayWorkout.estimatedMinutes })}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {todayWorkout.muscleGroups.map(mg => (
                  <span key={mg} className="text-xs px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-300 capitalize">
                    {mg.replace('_', ' ')}
                  </span>
                ))}
              </div>

              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('home_exercises_count', { count: todayWorkout.exercises.length })} · {todayWorkout.difficulty}
              </p>

              <div className="flex gap-2">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate({ to: '/workouts', search: { workoutId: todayWorkout.id } } as never)}
                >
                  {t('home_start')}
                </Button>
                <Button variant="ghost" size="lg" onClick={handleGenerateWorkout}>
                  🔄
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-center py-4">
              <p style={{ color: 'var(--text-secondary)' }}>{t('home_generate_desc')}</p>
              <Button size="lg" className="w-full" onClick={handleGenerateWorkout} disabled={generating}>
                {generating ? t('home_generating') : t('home_generate')}
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <Card className="text-center space-y-1 cursor-pointer active:scale-95 transition-transform"
              onClick={() => navigate({ to: '/progress' })}>
          <span className="text-3xl">📊</span>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('home_progress')}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('home_progress_desc')}</p>
        </Card>

        <Card className="text-center space-y-1 cursor-pointer active:scale-95 transition-transform"
              onClick={() => navigate({ to: '/workouts', search: {} } as never)}>
          <span className="text-3xl">📋</span>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('home_all_workouts')}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('home_all_workouts_desc')}</p>
        </Card>
      </motion.div>
    </div>
  )
}
