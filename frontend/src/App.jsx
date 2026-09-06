import { useState } from 'react'
import { QrCode, ScanLine } from 'lucide-react'
import GeneratePanel from './pages/GeneratePanel'
import DecodePanel from './pages/DecodePanel'

export default function App() {
  const [tab, setTab] = useState('generate') // generate | decode

  return (
    <div className="min-h-full">
      <header className="border-b border-ink-700">
        <div className="mx-auto max-w-2xl px-5 py-6 text-center">
          <p className="mb-1 text-[12.5px] font-medium text-signal-teal">ScanFlow</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-paper-100">
            The workflow behind a QR code
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] text-paper-500">
            So many QR codes get scanned every day — here's the actual work that happens
            behind that one scan, in both directions.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 pb-24 pt-8">
        <div className="mb-8 flex justify-center gap-2">
          <button
            onClick={() => setTab('generate')}
            className={`flex items-center gap-2 rounded-lg border px-5 py-2.5 text-[13.5px] font-medium transition-colors ${
              tab === 'generate'
                ? 'border-signal-amber bg-signal-amber/10 text-signal-amber'
                : 'border-ink-600 text-paper-300 hover:border-signal-amber/40'
            }`}
          >
            <QrCode size={16} /> Generate a QR
          </button>
          <button
            onClick={() => setTab('decode')}
            className={`flex items-center gap-2 rounded-lg border px-5 py-2.5 text-[13.5px] font-medium transition-colors ${
              tab === 'decode'
                ? 'border-signal-amber bg-signal-amber/10 text-signal-amber'
                : 'border-ink-600 text-paper-300 hover:border-signal-amber/40'
            }`}
          >
            <ScanLine size={16} /> Scan a QR
          </button>
        </div>

        {tab === 'generate' ? <GeneratePanel /> : <DecodePanel />}
      </div>
    </div>
  )
}
