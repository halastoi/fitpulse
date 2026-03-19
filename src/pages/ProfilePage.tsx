import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useUserStore } from '@/stores/useUserStore'
import { useThemeStore } from '@/stores/useThemeStore'
import { useI18n } from '@/i18n/useI18n'
import { localeNames, type Locale } from '@/i18n/translations'
import { db } from '@/db'
import { XPBar } from '@/components/ui/XPBar'
import { StreakBadge } from '@/components/ui/StreakBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Equipment, Difficulty, Achievement } from '@/types'

export function ProfilePage() {
  const { profile, loading, load, updateEquipment, updateDifficulty, updateName } = useUserStore()
  const { theme, setTheme } = useThemeStore()
  const { t, locale, setLocale } = useI18n()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [addingCustomEq, setAddingCustomEq] = useState(false)
  const [customEqInput, setCustomEqInput] = useState('')

  useEffect(() => {
    load()
    db.achievements.toArray().then(setAchievements)
  }, [load])

  if (loading || !profile) return null

  const allEquipment: { value: Equipment; label: string; icon: string }[] = [
    { value: 'none', label: t('eq_none'), icon: '🤸' },
    { value: 'dumbbells', label: t('eq_dumbbells'), icon: '🏋️' },
    { value: 'barbell', label: t('eq_barbell'), icon: '🏋️‍♂️' },
    { value: 'kettlebell', label: t('eq_kettlebell'), icon: '🔔' },
    { value: 'bands', label: t('eq_bands'), icon: '🪢' },
    { value: 'pull_up_bar', label: t('eq_pull_up_bar'), icon: '🔩' },
    { value: 'bench', label: t('eq_bench'), icon: '🪑' },
    { value: 'trx', label: t('eq_trx'), icon: '⛓️' },
    { value: 'medicine_ball', label: t('eq_medicine_ball'), icon: '⚾' },
    { value: 'jump_rope', label: t('eq_jump_rope'), icon: '🪢' },
    { value: 'foam_roller', label: t('eq_foam_roller'), icon: '🧘' },
    { value: 'ab_wheel', label: t('eq_ab_wheel'), icon: '☸️' },
    { value: 'dip_station', label: t('eq_dip_station'), icon: '🔲' },
    { value: 'cable_machine', label: t('eq_cable_machine'), icon: '🔧' },
    { value: 'smith_machine', label: t('eq_smith_machine'), icon: '⚙️' },
    { value: 'treadmill', label: t('eq_treadmill'), icon: '🏃' },
    { value: 'bike', label: t('eq_bike'), icon: '🚴' },
    { value: 'rowing', label: t('eq_rowing'), icon: '🚣' },
    { value: 'box', label: t('eq_box'), icon: '📦' },
  ]

  // Custom equipment that user has added (not in default list)
  const customEquipment = profile.equipment.filter(eq => !allEquipment.some(ae => ae.value === eq))

  const handleAddCustom = () => {
    const name = customEqInput.trim()
    if (name && !profile.equipment.includes(name)) {
      updateEquipment([...profile.equipment, name])
    }
    setCustomEqInput('')
    setAddingCustomEq(false)
  }

  const handleRemoveCustom = (eq: string) => {
    const updated = profile.equipment.filter(e => e !== eq)
    if (updated.length > 0) updateEquipment(updated)
  }

  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'beginner', label: t('diff_beginner') },
    { value: 'intermediate', label: t('diff_intermediate') },
    { value: 'advanced', label: t('diff_advanced') },
  ]

  const themes = [
    { value: 'dark' as const, label: t('theme_dark'), icon: '🌙' },
    { value: 'light' as const, label: t('theme_light'), icon: '☀️' },
    { value: 'system' as const, label: t('theme_system'), icon: '⚙️' },
  ]

  const locales: Locale[] = ['en', 'ro', 'ru', 'es']

  const toggleEquipment = (eq: Equipment) => {
    const current = profile.equipment
    const updated = current.includes(eq)
      ? current.filter(e => e !== eq)
      : [...current, eq]
    if (updated.length > 0) updateEquipment(updated)
  }

  const handleSaveName = () => {
    if (nameInput.trim()) updateName(nameInput.trim())
    setEditingName(false)
  }

  const unlockedCount = achievements.filter(a => a.unlockedAt).length

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card glow className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          {editingName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="flex-1 rounded-xl px-4 py-2 text-center outline-none focus:ring-2 focus:ring-primary-500"
                style={{ backgroundColor: 'var(--surface-input)', color: 'var(--text-primary)' }}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              />
              <Button size="sm" onClick={handleSaveName}>{t('profile_save')}</Button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{profile.name}</h2>
              <button
                className="text-xs hover:text-primary-400 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => { setNameInput(profile.name); setEditingName(true) }}
              >
                {t('profile_edit_name')}
              </button>
            </div>
          )}

          <XPBar xp={profile.xp} level={profile.level} />
          <StreakBadge streak={profile.streak} />
        </Card>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="space-y-3">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('profile_theme')}</h3>
          <div className="flex gap-2">
            {themes.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  theme === value ? 'bg-primary-600 text-white' : ''
                }`}
                style={theme !== value ? { backgroundColor: 'var(--surface-muted)', color: 'var(--text-secondary)' } : undefined}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Language */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="space-y-3">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('profile_language')}</h3>
          <div className="grid grid-cols-2 gap-2">
            {locales.map(loc => (
              <button
                key={loc}
                onClick={() => setLocale(loc)}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                  locale === loc ? 'bg-primary-600 text-white' : ''
                }`}
                style={locale !== loc ? { backgroundColor: 'var(--surface-muted)', color: 'var(--text-secondary)' } : undefined}
              >
                {localeNames[loc]}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Difficulty */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="space-y-3">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('profile_difficulty')}</h3>
          <div className="flex gap-2">
            {difficulties.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateDifficulty(value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  profile.difficulty === value ? 'bg-primary-600 text-white' : ''
                }`}
                style={profile.difficulty !== value ? { backgroundColor: 'var(--surface-muted)', color: 'var(--text-secondary)' } : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Equipment */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="space-y-3">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('profile_equipment')}</h3>
          <div className="flex flex-wrap gap-2">
            {allEquipment.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => toggleEquipment(value)}
                className={`text-sm px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                  profile.equipment.includes(value) ? 'bg-accent-600 text-white' : ''
                }`}
                style={!profile.equipment.includes(value) ? { backgroundColor: 'var(--surface-muted)', color: 'var(--text-secondary)' } : undefined}
              >
                <span className="text-xs">{icon}</span> {label}
              </button>
            ))}

            {/* Custom equipment items */}
            {customEquipment.map(eq => (
              <button
                key={eq}
                onClick={() => handleRemoveCustom(eq)}
                className="text-sm px-3 py-1.5 rounded-full bg-accent-600 text-white flex items-center gap-1 transition-all"
              >
                {eq} <span className="text-[10px] opacity-70">✕</span>
              </button>
            ))}

            {/* Add custom button / input */}
            {addingCustomEq ? (
              <div className="flex gap-1.5 w-full mt-1">
                <input
                  type="text"
                  value={customEqInput}
                  onChange={e => setCustomEqInput(e.target.value)}
                  placeholder={t('eq_custom_placeholder')}
                  className="flex-1 text-sm px-3 py-1.5 rounded-full outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ backgroundColor: 'var(--surface-input)', color: 'var(--text-primary)' }}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddCustom()
                    if (e.key === 'Escape') { setAddingCustomEq(false); setCustomEqInput('') }
                  }}
                />
                <Button size="sm" onClick={handleAddCustom}>+</Button>
                <button
                  onClick={() => { setAddingCustomEq(false); setCustomEqInput('') }}
                  className="text-sm px-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingCustomEq(true)}
                className="text-sm px-3 py-1.5 rounded-full border-2 border-dashed transition-all hover:border-primary-400"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
              >
                {t('eq_custom_add')}
              </button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('profile_achievements')}</h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{unlockedCount}/{achievements.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={`p-3 rounded-xl text-center space-y-1 ${
                  ach.unlockedAt ? 'bg-xp/10 border border-xp/20' : 'opacity-40'
                }`}
                style={!ach.unlockedAt ? { backgroundColor: 'var(--surface-muted)' } : undefined}
              >
                <span className="text-2xl">{ach.icon}</span>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{ach.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{ach.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
