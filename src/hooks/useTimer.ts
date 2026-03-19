import { useState, useEffect, useCallback, useRef } from 'react'

interface UseTimerOptions {
  initialSeconds?: number
  countdown?: boolean
  onComplete?: () => void
}

export function useTimer({ initialSeconds = 0, countdown = false, onComplete }: UseTimerOptions = {}) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isRunning) {
      clear()
      return
    }

    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (countdown) {
          if (prev <= 1) {
            setIsRunning(false)
            onComplete?.()
            return 0
          }
          return prev - 1
        }
        return prev + 1
      })
    }, 1000)

    return clear
  }, [isRunning, countdown, onComplete, clear])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])
  const reset = useCallback((newSeconds?: number) => {
    setIsRunning(false)
    setSeconds(newSeconds ?? initialSeconds)
  }, [initialSeconds])
  const toggle = useCallback(() => setIsRunning(r => !r), [])

  const formatted = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

  return { seconds, formatted, isRunning, start, pause, reset, toggle }
}
