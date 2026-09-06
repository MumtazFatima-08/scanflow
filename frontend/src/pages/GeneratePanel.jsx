import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PipelineView from '../components/PipelineView'
import ActivityLog from '../components/ActivityLog'
import QRResult from '../components/QRResult'
import { QR_TYPES } from '../data/qrTypes'
import { useWorkflow } from '../hooks/useWorkflow'
import { api } from '../services/api'

export default function GeneratePanel() {
  const [typeId, setTypeId] = useState('website')
  const [values, setValues] = useState({ security: 'WPA' })
  const { status, result, visibleSteps, visibleLogCount, error, run, reset } = useWorkflow()

  const type = QR_TYPES.find((t) => t.id === typeId)
  const running = status === 'running'
  const done = status === 'done'

  const selectType = (id) => {
    setTypeId(id)
    setValues({ security: 'WPA' })
    reset()
  }

  const setField = (name, value) => setValues((v) => ({ ...v, [name]: value }))

  const handleGenerate = () => {
    const fields = { ...values }
    if (type.linkKind) fields.link_kind = type.linkKind
    run(() => api.generateQR(type.backendType, fields))
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-[13px] text-paper-500">What should this QR code point to?</p>
        <div className="flex flex-wrap gap-2">
          {QR_TYPES.map((t) => {
            const Icon = t.icon
            const active = t.id === typeId
            return (
              <button
                key={t.id}
                onClick={() => selectType(t.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                  active
                    ? 'border-signal-amber bg-signal-amber/10 text-signal-amber'
                    : 'border-ink-600 text-paper-300 hover:border-signal-amber/40'
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-ink-600 bg-ink-950 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {type.fields.map((f) => (
            <label key={f.name} className={f.name === 'url' ? 'sm:col-span-2' : ''}>
              <span className="mb-1 block text-[12.5px] text-paper-500">{f.label}</span>
              {f.type === 'select' ? (
                <select
                  value={values[f.name] ?? f.options[0]}
                  onChange={(e) => setField(f.name, e.target.value)}
                  className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-[13.5px] text-paper-100 outline-none focus:border-signal-amber"
                >
                  {f.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={values[f.name] || ''}
                  onChange={(e) => setField(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-[13.5px] text-paper-100 outline-none placeholder:text-paper-500/70 focus:border-signal-amber"
                />
              )}
            </label>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={running}
          className="mt-4 w-full rounded-md bg-signal-amber py-2.5 text-[13.5px] font-semibold text-ink-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-6"
        >
          {running ? 'Building…' : 'Generate QR code'}
        </button>
      </div>

      {error && (
        <p className="rounded-md border border-signal-red/40 bg-signal-red/10 px-4 py-2.5 text-[13px] text-signal-red">
          {error}
        </p>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="rounded-xl border border-ink-600 bg-ink-800/40 p-5">
              <p className="mb-4 text-[13px] text-paper-500">How it got built</p>
              <PipelineView steps={result.pipeline} visibleCount={visibleSteps} />
            </div>
            <ActivityLog entries={result.log} visibleCount={visibleLogCount} />
            {done && result.status === 'completed' && <QRResult qrImage={result.qr_image} payload={result.payload} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
