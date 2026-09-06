import { useCallback, useState } from 'react'

const STEP_REVEAL_MS = 420

/**
 * Runs any QR workflow call (generate or decode), then paces the returned
 * pipeline/log back to the UI step-by-step. The backend already computed
 * the whole result — this only controls the timing of the reveal, never
 * the content.
 */
export function useWorkflow() {
  const [status, setStatus] = useState('idle') // idle | running | done | error
  const [result, setResult] = useState(null)
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [visibleLogCount, setVisibleLogCount] = useState(0)
  const [error, setError] = useState(null)

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setVisibleSteps(0)
    setVisibleLogCount(0)
    setError(null)
  }, [])

  const run = useCallback(async (promiseFn) => {
    reset()
    setStatus('running')
    try {
      const data = await promiseFn()
      setResult(data)

      const totalSteps = data.pipeline.length
      const totalLogs = data.log.length

      let stepIdx = 0
      const stepTimer = setInterval(() => {
        stepIdx += 1
        setVisibleSteps(stepIdx)
        if (stepIdx >= totalSteps) clearInterval(stepTimer)
      }, STEP_REVEAL_MS)

      let logIdx = 0
      const logTimer = setInterval(() => {
        logIdx += 1
        setVisibleLogCount(logIdx)
        if (logIdx >= totalLogs) clearInterval(logTimer)
      }, STEP_REVEAL_MS * 0.6)

      const totalDelay = Math.max(totalSteps * STEP_REVEAL_MS, totalLogs * STEP_REVEAL_MS * 0.6) + 200
      setTimeout(() => setStatus(data.status === 'failed' ? 'error' : 'done'), totalDelay)
    } catch (e) {
      setError(e.message || 'Something went wrong')
      setStatus('error')
    }
  }, [reset])

  return { status, result, visibleSteps, visibleLogCount, error, run, reset }
}
