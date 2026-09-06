# ScanFlow

**The workflow behind a QR code.**

QR codes are everywhere — menus, WiFi networks, payment counters, forms, business
cards. Everyone scans them. Almost nobody sees what actually happens in between
the scan and the result. ScanFlow shows that, in both directions:

1. **Generate** — give it a website link, a WiFi network, a contact, or a UPI ID,
   and watch it build a real, scannable QR code step by step.
2. **Decode** — upload a QR code image (or paste its raw text) and watch it get
   read, classified, and turned back into the actual target it points to.

It's a real tool, not a mockup: the QR codes it creates are genuinely scannable
with your phone's camera, and the decoder genuinely reads real QR images.

## What it supports

| Type | What it builds | Standard format used |
|---|---|---|
| Website / Link | A plain URL | `https://...` |
| Form Link | A plain URL (labeled as a form) | `https://...` |
| Social / Account | A plain URL (labeled as a profile) | `https://...` |
| WiFi Network | Auto-connect WiFi QR | `WIFI:T:...;S:...;P:...;H:...;;` |
| Contact Card | A shareable contact | vCard 3.0 |
| UPI / Payment | A UPI payment link | `upi://pay?pa=...` |

These are real, standard QR formats already understood by phone cameras and QR
apps — ScanFlow isn't inventing its own format.

## How it works

Every action — generate or decode — walks through a small pipeline, and the UI
shows every step instead of jumping straight to the result:

**Generate:** Validate details → Build the payload string → Encode the QR image
→ Verify it scans back correctly (a genuine round-trip decode check) → Ready to
download.

**Decode:** Read the input → Locate the QR code in the image → Decode the raw
payload → Classify what type of target it is → Extract the structured fields →
Reveal the target.

## Architecture

```
backend/app/
  main.py          FastAPI app, CORS, router wiring
  api/qr_routes.py  The two endpoints: /api/qr/generate and /api/qr/decode
  qr/
    payloads.py      Builds the exact standard-format string for each type
    parser.py         Reverse direction: classifies + parses a decoded payload
    qr_image.py        Real QR encode (qrcode) and decode (OpenCV)
  utils/pipeline.py  Shared pipeline/log result shape used by both directions

frontend/src/
  App.jsx              Single page, two tabs: Generate / Scan
  pages/
    GeneratePanel.jsx   Pick a type, fill fields, watch it get built
    DecodePanel.jsx      Upload or paste, watch it get read
  components/
    PipelineView.jsx / PipelineNode.jsx   Animated step-by-step pipeline
    ActivityLog.jsx                        Terminal-style log of what happened
    QRResult.jsx                           The generated, downloadable QR image
    TargetReveal.jsx                       The decoded target, with real actions
  data/qrTypes.js       The 6 supported types and their form fields
  hooks/useWorkflow.js  Paces the (already-complete) backend result into an animation
```

The backend computes the full result in one response; the frontend only
controls the *timing* of the reveal — every step and log line shown was
actually produced by the backend, nothing is fabricated for effect.

## Installation

Requirements: Python 3.10+, Node.js 18+.

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

## Running

```bash
# Terminal 1
cd backend
python3 -m uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend
npm run dev
```

Open http://127.0.0.1:5173. API docs at http://127.0.0.1:8000/docs.

## Testing

```bash
curl http://127.0.0.1:8000/api/health

# Generate a WiFi QR
curl -X POST http://127.0.0.1:8000/api/qr/generate \
  -H "Content-Type: application/json" \
  -d '{"qr_type":"WIFI","fields":{"ssid":"HomeNetwork","password":"secret123"}}'

# Decode by pasting the payload text directly
curl -X POST http://127.0.0.1:8000/api/qr/decode -F "text=https://example.com"

# Decode by uploading an image
curl -X POST http://127.0.0.1:8000/api/qr/decode -F "file=@/path/to/qr.png"
```

## Try it yourself

- Generate a **WiFi** QR for a network you own, download it, and scan it with
  a second phone's camera — it should offer to join the network.
- Generate a **Contact** QR, scan it, and your phone should offer to save it
  as a new contact.
- Generate any QR, then immediately paste it back into the **Scan a QR** tab
  (or re-upload the downloaded image) to see the reverse direction work on
  the exact same code.

## Safety notes

- WiFi passwords are shown once, only after a successful decode, with a
  reveal/copy control — ScanFlow never auto-connects to a network for you.
- UPI QR codes only ever produce a standard payment *link* — no payment is
  ever processed by ScanFlow itself.
- Decoding only ever reads the QR's own published payload; it never fetches
  or previews the destination on your behalf.
