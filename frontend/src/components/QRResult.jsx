import { motion } from 'framer-motion'
import { Download } from 'lucide-react'

export default function QRResult({ qrImage, payload }) {
  const download = () => {
    const a = document.createElement('a')
    a.href = qrImage
    a.download = 'scanflow-qr.png'
    a.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center rounded-xl border border-ink-600 bg-ink-950 p-6 text-center"
    >
      <p className="text-[13px] text-paper-500">Your QR code — real and scannable</p>
      <img
        src={qrImage}
        alt="Generated QR code"
        className="my-4 h-48 w-48 rounded-lg border border-ink-700 bg-ink-950 p-2 sm:h-56 sm:w-56"
      />
      <button
        onClick={download}
        className="flex items-center gap-1.5 rounded-md bg-signal-amber px-4 py-2 text-[13px] font-semibold text-ink-950"
      >
        <Download size={14} /> Download PNG
      </button>

      <details className="mt-4 w-full">
        <summary className="cursor-pointer text-[12px] text-paper-500 hover:text-paper-300">
          Show what's actually inside this QR
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-md border border-ink-700 bg-ink-900 p-3 text-left font-mono text-[11.5px] text-paper-300">
          {payload}
        </pre>
      </details>
    </motion.div>
  )
}
