import { AnimatePresence, motion } from 'framer-motion'
import { useScanLog } from '../hooks/useScanLog'

const LEVEL_COLOR = {
  info: 'text-paper-300',
  success: 'text-signal-green',
  warn: 'text-signal-amber',
  error: 'text-signal-red',
}

const LEVEL_PREFIX = {
  info: '→',
  success: '✓',
  warn: '!',
  error: '✕',
}

export default function ActivityLog({ entries, visibleCount }) {
  const containerRef = useScanLog(visibleCount)
  const shown = entries.slice(0, visibleCount)

  return (
    <div
      ref={containerRef}
      className="h-52 overflow-y-auto rounded-md border border-ink-700 bg-ink-950 p-3 font-mono text-[12px] leading-relaxed"
    >
      {shown.length === 0 && (
        <p className="text-paper-500">Waiting for scan activity…</p>
      )}
      <AnimatePresence initial={false}>
        {shown.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2"
          >
            <span className={LEVEL_COLOR[entry.level] || 'text-paper-300'}>
              {LEVEL_PREFIX[entry.level] || '→'}
            </span>
            <span className="shrink-0 text-paper-500">[{entry.stage}]</span>
            <span className={LEVEL_COLOR[entry.level] || 'text-paper-300'}>{entry.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
