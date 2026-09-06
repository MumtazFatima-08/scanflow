import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, ExternalLink, Download, Eye, EyeOff } from 'lucide-react'
import { DECODE_TYPE_META } from '../data/qrTypes'

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
      className="flex items-center gap-1 rounded-md border border-ink-600 px-2 py-1 text-[11.5px] text-paper-500 hover:text-paper-100"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Row({ label, value, action }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-700 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="text-[11px] text-paper-500">{label}</p>
        <p className="truncate text-[13.5px] text-paper-100">{value}</p>
      </div>
      {action}
    </div>
  )
}

export default function TargetReveal({ qrType, fields, payload }) {
  const [showPassword, setShowPassword] = useState(false)
  const meta = DECODE_TYPE_META[qrType] || DECODE_TYPE_META.TEXT
  const Icon = meta.icon

  const downloadVCard = () => {
    const blob = new Blob([payload], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fields.name || 'contact'}.vcf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-ink-600 bg-ink-950 p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 bg-ink-800 text-signal-amber">
          <Icon size={18} />
        </span>
        <div>
          <p className="text-[13px] text-paper-500">This QR code leads to</p>
          <p className="text-[15px] font-semibold text-paper-100">{meta.label}</p>
        </div>
      </div>

      {(qrType === 'WEBSITE' || qrType === 'FORM' || qrType === 'SOCIAL') && (
        <div>
          <Row
            label="Link"
            value={fields.url}
            action={
              <a
                href={fields.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-md bg-signal-amber px-3 py-1.5 text-[12px] font-semibold text-ink-950"
              >
                Open <ExternalLink size={12} />
              </a>
            }
          />
        </div>
      )}

      {qrType === 'WIFI' && (
        <div>
          <Row label="Network name" value={fields.ssid} action={<CopyButton value={fields.ssid} />} />
          <Row
            label="Password"
            value={fields.password ? (showPassword ? fields.password : '••••••••') : 'None (open network)'}
            action={
              fields.password && (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setShowPassword((v) => !v)} className="text-paper-500 hover:text-paper-100">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <CopyButton value={fields.password} />
                </div>
              )
            }
          />
          <Row label="Security" value={fields.security} />
          <p className="mt-3 text-[12px] text-paper-500">
            For safety, ScanFlow doesn't auto-connect to networks. Copy the password and connect
            from your device's WiFi settings.
          </p>
        </div>
      )}

      {qrType === 'CONTACT' && (
        <div>
          <Row label="Name" value={fields.name} />
          <Row label="Phone" value={fields.phone} action={fields.phone && <CopyButton value={fields.phone} />} />
          <Row label="Email" value={fields.email} action={fields.email && <CopyButton value={fields.email} />} />
          <Row label="Organization" value={fields.organization} />
          <button
            onClick={downloadVCard}
            className="mt-3 flex items-center gap-1.5 rounded-md bg-signal-amber px-3 py-1.5 text-[12.5px] font-semibold text-ink-950"
          >
            <Download size={13} /> Save contact (.vcf)
          </button>
        </div>
      )}

      {qrType === 'UPI' && (
        <div>
          <Row label="UPI ID" value={fields.upi_id} action={<CopyButton value={fields.upi_id} />} />
          <Row label="Payee name" value={fields.payee_name} />
          <Row label="Amount" value={fields.amount ? `₹${fields.amount}` : null} />
          <a
            href={payload}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-signal-amber px-3 py-1.5 text-[12.5px] font-semibold text-ink-950"
          >
            Pay via UPI app <ExternalLink size={12} />
          </a>
          <p className="mt-2 text-[12px] text-paper-500">Only works on a phone with a UPI app installed.</p>
        </div>
      )}

      {qrType === 'TEXT' && <p className="whitespace-pre-wrap break-words text-[13.5px] text-paper-100">{fields.raw}</p>}

      <details className="mt-4">
        <summary className="cursor-pointer text-[12px] text-paper-500 hover:text-paper-300">
          Show raw QR data
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-md border border-ink-700 bg-ink-900 p-3 font-mono text-[11.5px] text-paper-300">
          {payload}
        </pre>
      </details>
    </motion.div>
  )
}
