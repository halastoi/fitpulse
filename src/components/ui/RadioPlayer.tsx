import { motion } from 'motion/react'
import { useRadioStore, radioStations } from '@/stores/useRadioStore'
import { useI18n } from '@/i18n/useI18n'

export function RadioFloatingButton() {
  const { isPlaying, togglePanel, panelOpen } = useRadioStore()

  if (panelOpen) return null

  return (
    <button
      onClick={togglePanel}
      className="fixed top-4 right-4 z-40 w-11 h-11 rounded-full bg-primary-600 shadow-lg shadow-primary-600/30 flex items-center justify-center text-white text-lg hover:bg-primary-500 active:scale-90 transition-all"
    >
      {isPlaying ? (
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🎵
        </motion.span>
      ) : (
        '📻'
      )}
    </button>
  )
}

export function RadioPanel() {
  const { isPlaying, currentStation, panelOpen, play, stop, togglePlay, toggleMute, isMuted, volume, setVolume, togglePanel } = useRadioStore()
  const { t } = useI18n()

  if (!panelOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={togglePanel}
      />

      <motion.div
        className="fixed top-0 right-0 h-full w-72 z-[60] p-4 pt-6 flex flex-col gap-4 overflow-y-auto shadow-2xl"
        style={{ backgroundColor: 'var(--nav-bg)', backdropFilter: 'blur(20px)' }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {t('profile_radio')}
          </h3>
          <button
            onClick={togglePanel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ backgroundColor: 'var(--surface-muted)', color: 'var(--text-primary)' }}
          >
            ✕
          </button>
        </div>

        <div
          className="rounded-xl p-3 flex items-center gap-3"
          style={{ backgroundColor: 'var(--surface-bg)', border: '1px solid var(--surface-border)' }}
        >
          {currentStation ? (
            <>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white shrink-0 hover:bg-primary-500 transition-colors"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {currentStation.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentStation.genre}</p>
              </div>
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-4 shrink-0">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      className="w-1 bg-primary-400 rounded-full"
                      animate={{ height: ['4px', '14px', '4px'] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm w-full text-center py-1" style={{ color: 'var(--text-muted)' }}>
              {t('radio_stopped')}
            </p>
          )}
        </div>

        {currentStation && (
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-lg w-8 text-center">
              {isMuted ? '🔇' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1.5 accent-primary-500 rounded-full"
            />
            <button
              onClick={stop}
              className="text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg text-sm"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            >
              ■ {t('radio_stop')}
            </button>
          </div>
        )}

        <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
          {t('radio_credit')}
        </p>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {t('radio_stations_label')}
          </p>
          {radioStations.map(station => (
            <button
              key={station.id}
              onClick={() => play(station)}
              className={`text-left p-3 rounded-xl transition-all ${
                currentStation?.id === station.id
                  ? 'bg-primary-600/20 ring-1 ring-primary-500/40'
                  : 'hover:opacity-80'
              }`}
              style={
                currentStation?.id !== station.id
                  ? { backgroundColor: 'var(--surface-muted)' }
                  : undefined
              }
            >
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                {station.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{station.genre}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </>
  )
}
