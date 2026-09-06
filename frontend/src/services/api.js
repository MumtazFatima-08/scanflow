const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

async function handle(res) {
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail || detail
    } catch {
      /* ignore */
    }
    throw new Error(detail)
  }
  return res.json()
}

export const api = {
  async generateQR(qrType, fields) {
    const res = await fetch(`${API_URL}/api/qr/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qr_type: qrType, fields }),
    })
    return handle(res)
  },

  async decodeQRFile(file) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_URL}/api/qr/decode`, { method: 'POST', body: form })
    return handle(res)
  },

  async decodeQRText(text) {
    const form = new FormData()
    form.append('text', text)
    const res = await fetch(`${API_URL}/api/qr/decode`, { method: 'POST', body: form })
    return handle(res)
  },
}
