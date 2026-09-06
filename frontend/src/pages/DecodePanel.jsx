import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Type } from 'lucide-react'
import PipelineView from '../components/PipelineView'
import ActivityLog from '../components/ActivityLog'
import TargetReveal from '../components/TargetReveal'
import { useWorkflow } from '../hooks/useWorkflow'
import { api } from '../services/api'

export default function DecodePanel() {
  const [mode, setMode] = useState('upload') // upload | paste
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [text, setText] = useState('')
  const { status, result, visibleSteps, visibleLogCount, error, run } = useWorkflow()

  const running = status === 'running'
  const done = status === 'done'

  const onFile = (f) => {
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  const handleDecode = () => {
    if (mode === 'upload' && file) run(() => api.decodeQRFile(file))
    if (mode === 'paste' && text.trim()) run(() => api.decodeQRText(text.trim()))
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
            mode === 'upload' ? 'border-signal-amber bg-signal-amber/10 text-signal-amber' : 'border-ink-600 text-paper-300'
          }`}
        >
          <Upload size={14} /> Upload image
        </button>
        <button
          onClick={() => setMode('paste')}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
            mode === 'paste' ? 'border-signal-amber bg-signal-amber/10 text-signal-amber' : 'border-ink-600 text-paper-300'
          }`}
        >
          <Type size={14} /> Paste QR text instead
        </button>
      </div>

      <div className="rounded-xl border border-ink-600 bg-ink-950 p-5">
        {mode === 'upload' ? (
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed border-ink-600 bg-ink-800/50 px-4 py-8 text-center transition-colors hover:border-signal-amber/50">
            {preview ? (
              <img src={preview} alt="QR preview" className="h-28 w-28 rounded-md border border-ink-600 object-contain bg-white p-1" />
            ) : (
              <Upload size={22} className="text-paper-500" />
            )}
            <p className="text-[13px] text-paper-500">
              {file ? file.name : 'Click to choose a QR code image (photo or screenshot)'}
            </p>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] || null)} />
          </label>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the QR code's raw text here, e.g. WIFI:T:WPA;S:MyNetwork;P:mypassword;;"
            rows={4}
            className="w-full resize-none rounded-md border border-ink-600 bg-ink-800 px-3 py-2 font-mono text-[13px] text-paper-100 outline-none placeholder:text-paper-500/60 focus:border-signal-amber"
          />
        )}

        <button
          onClick={handleDecode}
          disabled={running || (mode === 'upload' ? !file : !text.trim())}
          className="mt-4 w-full rounded-md bg-signal-amber py-2.5 text-[13.5px] font-semibold text-ink-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-6"
        >
          {running ? 'Reading…' : 'Decode QR code'}
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
              <p className="mb-4 text-[13px] text-paper-500">How it got read</p>
              <PipelineView steps={result.pipeline} visibleCount={visibleSteps} />
            </div>
            <ActivityLog entries={result.log} visibleCount={visibleLogCount} />
            {done && result.status === 'completed' && (
              <TargetReveal qrType={result.qr_type} fields={result.fields} payload={result.payload} />
            )}
            {done && result.status === 'failed' && (
              <div className="rounded-lg border border-signal-red/40 bg-signal-red/10 p-4 text-center text-[13px] text-signal-red">
                Couldn't read a QR code there — try a clearer image, or paste the text instead.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
