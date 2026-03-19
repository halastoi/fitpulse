import { motion } from 'motion/react'
import { useI18n } from '@/i18n/useI18n'
import { getXPProgress, getXPForNextLevel, formatXP } from '@/utils/xp'

interface XPBarProps {
  xp: number
  level: number
}

export function XPBar({ xp, level }: XPBarProps) {
  const progress = getXPProgress(xp)
  const nextLevelXP = getXPForNextLevel(xp)
  const { t } = useI18n()

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-xp">{t('level', { level })}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {formatXP(xp)} / {formatXP(nextLevelXP)} XP
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-muted)' }}>
        <motion.div
          className="h-full bg-gradient-to-r from-xp to-amber-300 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
