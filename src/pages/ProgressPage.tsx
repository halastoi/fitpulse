import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { db } from '@/db'
import { useI18n } from '@/i18n/useI18n'
import { useThemeStore } from '@/stores/useThemeStore'
import { Card } from '@/components/ui/Card'
import type { WorkoutLog } from '@/types'

export function ProgressPage() {
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const { t, locale } = useI18n()
  const { resolved: themeMode } = useThemeStore()

  useEffect(() => {
    db.workoutLogs.orderBy('startedAt').reverse().toArray().then(setLogs)
  }, [])

  const gridColor = themeMode === 'dark' ? '#334155' : '#e2e8f0'
  const tickColor = themeMode === 'dark' ? '#94a3b8' : '#64748b'
  const tooltipBg = themeMode === 'dark' ? '#1e293b' : '#ffffff'
  const tooltipBorder = themeMode === 'dark' ? '#334155' : '#e2e8f0'

  const chartData = [...logs]
    .reverse()
    .map(log => ({
      date: new Date(log.startedAt).toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
      xp: log.xpEarned,
      sets: log.exercises.reduce((acc, e) => acc + e.sets.filter(s => s.completed).length, 0),
    }))

  const totalWorkouts = logs.length
  const totalXP = logs.reduce((acc, l) => acc + l.xpEarned, 0)
  const totalSets = logs.reduce((acc, l) => acc + l.exercises.reduce((te, e) => te + e.sets.filter(s => s.completed).length, 0), 0)
  const avgDuration = logs.length > 0
    ? Math.round(logs.reduce((acc, l) => acc + (l.completedAt ? (l.completedAt - l.startedAt) / 60000 : 0), 0) / logs.length)
    : 0

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('progress_title')}</h1>

      <motion.div className="grid grid-cols-2 gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="text-center">
          <p className="text-3xl font-bold text-primary-400">{totalWorkouts}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t('progress_workouts')}</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-xp">{totalXP}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t('progress_total_xp')}</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-accent-400">{totalSets}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t('progress_sets')}</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-streak">{avgDuration}m</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t('progress_avg_duration')}</p>
        </Card>
      </motion.div>

      {chartData.length > 1 && (
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{t('progress_xp_over_time')}</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: tickColor }} />
                <YAxis tick={{ fontSize: 10, fill: tickColor }} />
                <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {chartData.length > 1 && (
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{t('progress_sets_per_workout')}</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: tickColor }} />
                <YAxis tick={{ fontSize: 10, fill: tickColor }} />
                <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="sets" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {logs.length === 0 && (
        <Card className="text-center py-8 space-y-2">
          <span className="text-4xl">🏋️</span>
          <p style={{ color: 'var(--text-secondary)' }}>{t('progress_empty')}</p>
        </Card>
      )}

      {logs.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('progress_recent')}</h2>
          {logs.slice(0, 10).map(log => (
            <Card key={log.id} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {new Date(log.startedAt).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {t('progress_sets_count', { count: log.exercises.reduce((acc, e) => acc + e.sets.filter(s => s.completed).length, 0) })} ·{' '}
                  {log.completedAt ? `${Math.round((log.completedAt - log.startedAt) / 60000)} min` : t('progress_incomplete')}
                </p>
              </div>
              <span className="text-sm font-bold text-xp">+{log.xpEarned} XP</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
