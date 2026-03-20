import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { db } from '@/db'
import { useUserStore } from '@/stores/useUserStore'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { generateWorkout } from '@/utils/workout-generator'
import { useTimer } from '@/hooks/useTimer'
import { useI18n } from '@/i18n/useI18n'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Exercise, Workout, MuscleGroup } from '@/types'

const MUSCLE_KEYS = ['chest', 'back', 'shoulders', 'legs', 'core', 'cardio', 'full_body'] as const

export function WorkoutsPage() {
  const { profile } = useUserStore()
  const { active, startWorkout, completeSet, finishWorkout, abandonWorkout } = useWorkoutStore()
  const { addXP, updateStreak } = useUserStore()
  const { t } = useI18n()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>([])
  const [generatedWorkout, setGeneratedWorkout] = useState<Workout | null>(null)
  const [repsInput, setRepsInput] = useState('')
  const [weightInput, setWeightInput] = useState('')

  const restTimer = useTimer({ initialSeconds: 45, countdown: true })

  useEffect(() => {
    db.exercises.toArray().then(setExercises)
  }, [])

  const toggleMuscle = (muscle: MuscleGroup) => {
    setSelectedMuscles(prev =>
      prev.includes(muscle)
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle],
    )
  }

  const handleGenerate = async () => {
    if (!profile) return
    const workout = await generateWorkout({
      muscleGroups: selectedMuscles.length > 0 ? selectedMuscles : undefined,
      equipment: profile.equipment,
      difficulty: profile.difficulty,
    })
    setGeneratedWorkout(workout)
  }

  const handleStart = () => {
    if (!generatedWorkout) return
    startWorkout(generatedWorkout.id, generatedWorkout.exercises)
  }

  const handleCompleteSet = () => {
    const reps = parseInt(repsInput) || 0
    const weight = weightInput ? parseFloat(weightInput) : undefined
    if (reps > 0) {
      completeSet(reps, weight)
      setRepsInput('')
      setWeightInput('')
      restTimer.reset(45)
      restTimer.start()
    }
  }

  const handleFinish = async () => {
    const log = await finishWorkout()
    if (log) {
      await addXP(log.xpEarned)
      await updateStreak()
      setGeneratedWorkout(null)
    }
  }

  // Active workout view
  if (active) {
    const currentExercise = active.exercises[active.currentExerciseIndex]
    const exerciseInfo = exercises.find(e => e.id === currentExercise.exerciseId)
    const currentSet = currentExercise.sets[active.currentSetIndex]
    const totalSets = active.exercises.reduce((acc, e) => acc + e.sets.length, 0)
    const completedSets = active.exercises.reduce((acc, e) => acc + e.sets.filter(s => s.completed).length, 0)
    const allDone = active.exercises.every(ex => ex.sets.every(s => s.completed))

    return (
      <div className="px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('workouts_active')}
          </h1>
          <Button variant="danger" size="sm" onClick={abandonWorkout}>
            {t('workouts_quit')}
          </Button>
        </div>

        {/* Progress bar */}
        <div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-muted)' }}>
            <motion.div
              className="h-full bg-accent-500 rounded-full"
              animate={{ width: `${(completedSets / totalSets) * 100}%` }}
            />
          </div>
          <p className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('workouts_sets_completed', { completed: completedSets, total: totalSets })}
          </p>
        </div>

        {/* Rest timer */}
        {restTimer.isRunning && (
          <Card className="text-center space-y-2">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('workouts_rest')}</p>
            <p className="text-3xl font-mono font-bold text-accent-400">{restTimer.formatted}</p>
            <Button variant="ghost" size="sm" onClick={() => restTimer.reset()}>{t('workouts_skip_rest')}</Button>
          </Card>
        )}

        {/* Current exercise */}
        <Card glow className="space-y-3">
          {/* Exercise info */}
          <div className="text-center space-y-1">
            <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {t('workouts_exercise_of', { current: active.currentExerciseIndex + 1, total: active.exercises.length })}
            </p>
            <h2 className="text-lg font-bold text-primary-300">{exerciseInfo?.name ?? t('workouts_exercise_fallback')}</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {t('workouts_set_of', { current: active.currentSetIndex + 1, total: currentExercise.sets.length })}
              {currentSet.reps ? ` · ${t('workouts_target_reps', { reps: currentSet.reps })}` : ''}
            </p>
          </div>

          {/* Instructions */}
          {exerciseInfo?.instructions && (
            <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
              {exerciseInfo.instructions.map((inst, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary-400 shrink-0">{i + 1}.</span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Input & complete button */}
          {!allDone && (
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={t('workouts_reps')}
                  value={repsInput}
                  onChange={e => setRepsInput(e.target.value)}
                  className="flex-1 rounded-xl px-3 py-2.5 text-center text-base font-bold outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ backgroundColor: 'var(--surface-input)', color: 'var(--text-primary)' }}
                />
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={t('workouts_unit_kg')}
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  className="w-20 rounded-xl px-3 py-2.5 text-center text-base font-bold outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ backgroundColor: 'var(--surface-input)', color: 'var(--text-primary)' }}
                />
              </div>
              <Button size="md" className="w-full" onClick={handleCompleteSet}>
                {t('workouts_complete_set')}
              </Button>
            </div>
          )}

          {allDone && (
            <Button size="lg" className="w-full bg-accent-600 hover:bg-accent-500" onClick={handleFinish}>
              {t('workouts_finish')}
            </Button>
          )}
        </Card>

        {/* Sets overview - compact */}
        <Card className="space-y-2">
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{t('workouts_sets_overview')}</p>
          <div className="flex flex-wrap gap-1.5">
            {currentExercise.sets.map((s, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  s.completed
                    ? 'bg-accent-500/20 text-accent-400'
                    : i === active.currentSetIndex
                      ? 'bg-primary-600/30 text-primary-300 ring-1 ring-primary-500'
                      : ''
                }`}
                style={
                  !s.completed && i !== active.currentSetIndex
                    ? { backgroundColor: 'var(--surface-muted)', color: 'var(--text-muted)' }
                    : undefined
                }
              >
                {s.completed ? '✓' : i + 1}
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  // Workout generator view
  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {t('workouts_title')}
      </h1>

      <div className="space-y-2">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('workouts_target')}</p>
        <div className="flex flex-wrap gap-2">
          {MUSCLE_KEYS.map(key => (
            <button
              key={key}
              onClick={() => toggleMuscle(key)}
              className={`text-sm px-3 py-1.5 rounded-full transition-all ${
                selectedMuscles.includes(key)
                  ? 'bg-primary-600 text-white'
                  : ''
              }`}
              style={
                !selectedMuscles.includes(key)
                  ? { backgroundColor: 'var(--surface-muted)', color: 'var(--text-secondary)' }
                  : undefined
              }
            >
              {t(`muscle_${key}` as 'muscle_chest')}
            </button>
          ))}
        </div>
      </div>

      <Button size="lg" className="w-full" onClick={handleGenerate}>
        {t('workouts_generate')}
      </Button>

      {generatedWorkout && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card glow className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-primary-300">{generatedWorkout.name}</h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                {t('home_min', { min: generatedWorkout.estimatedMinutes })}
              </span>
            </div>

            <div className="space-y-1">
              {generatedWorkout.exercises.map((we, i) => {
                const info = exercises.find(e => e.id === we.exerciseId)
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2"
                    style={{ borderBottom: i < generatedWorkout.exercises.length - 1 ? '1px solid var(--surface-border)' : 'none' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{info?.name ?? we.exerciseId}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{we.sets.length} × {we.sets[0]?.reps}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-2">
              <Button size="lg" className="flex-1" onClick={handleStart}>
                {t('workouts_start')}
              </Button>
              <Button variant="ghost" size="lg" onClick={handleGenerate}>🔄</Button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('workouts_library')}
        </h2>
        {exercises.map(ex => (
          <Card key={ex.id} className="flex justify-between items-center">
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{ex.name}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                {ex.muscleGroups.join(', ').replace(/_/g, ' ')}
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              ex.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
              ex.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {t(`diff_${ex.difficulty}` as 'diff_beginner')}
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}
