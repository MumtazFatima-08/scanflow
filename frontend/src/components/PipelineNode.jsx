import { motion } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'

const STATUS_STYLES = {
  pending: 'border-ink-600 bg-ink-800 text-paper-500',
  active: 'border-signal-amber bg-ink-800 text-signal-amber',
  done: 'border-signal-teal/70 bg-ink-800 text-signal-teal',
  error: 'border-signal-red bg-ink-800 text-signal-red',
}

export default function ScannerNode({ step, index, revealed }) {
  const status = revealed ? step.status : 'pending'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: revealed ? 1 : 0.35, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex min-w-[104px] flex-col items-center gap-2 px-1"
    >
      <div className="relative">
        {status === 'active' && (
          <motion.span
            className="absolute inset-0 rounded-md bg-signal-amber/25"
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        )}
        <div
          className={`relative flex h-11 w-11 items-center justify-center rounded-md border font-mono text-[11px] font-semibold transition-colors ${STATUS_STYLES[status]}`}
        >
          {status === 'done' && <Check size={16} strokeWidth={2.5} />}
          {status === 'error' && <X size={16} strokeWidth={2.5} />}
          {status === 'active' && <Loader2 size={16} className="animate-spin" />}
          {status === 'pending' && String(index + 1).padStart(2, '0')}
        </div>
      </div>
      <div className="text-center">
        <p className="text-[11.5px] font-medium leading-tight text-paper-300">{step.label}</p>
        {revealed && step.detail && (
          <p className="mt-0.5 font-mono text-[10px] leading-tight text-paper-500">{step.detail}</p>
        )}
      </div>
    </motion.div>
  )
}
