import { motion } from 'motion/react'
import { useI18n } from '@/i18n/useI18n'

interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const { t } = useI18n()

  if (streak === 0) return null

  return (
    <motion.div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span className="text-streak text-lg">🔥</span>
      <span className="text-streak font-bold text-sm">{t('streak_days', { count: streak })}</span>
    </motion.div>
  )
}
