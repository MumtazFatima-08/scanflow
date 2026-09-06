# ScanFlow

> **The workflow behind a QR code.**

ScanFlow is a web-based QR workflow analyzer that goes beyond simply generating or scanning a QR code. It lets users **build structured QR payloads, generate real QR images, decode uploaded QR codes, classify their target type, extract useful fields, and reveal the destination** through a visible step-by-step pipeline.

## 📸 ScanFlow in action

### Generate a QR

![ScanFlow Generate](assets/01-generate.png)

Choose a payload type and build the QR workflow from structured input.

### Generated QR

![Generated QR](assets/02-generated-qr.png)

The generated QR is encoded, verified, and made available as a downloadable PNG.

### Scan & Decode

![Scan and Decode](assets/03-scan-upload.png)

Upload a QR image and send it through the decoding pipeline.

### Decode Result

![Decoded Result](assets/04-decoded-result.png)

ScanFlow identifies the target type and reveals the decoded destination.

## ✨ What it supports

| Type | What it builds | Standard format |
|---|---|---|
| Website / Link | A plain URL | `https://...` |
| Form Link | A plain URL | `https://...` |
| Social / Account | A profile URL | `https://...` |
| WiFi Network | Auto-connect WiFi QR | `WIFI:T:...;S:...;P:...;H:...;;` |
| Contact Card | A shareable contact | vCard 3.0 |
| UPI / Payment | A UPI payment link | `upi://pay?pa=...` |

These are real, standard QR formats already understood by phone cameras and QR applications.

## 🧠 How it works

ScanFlow exposes the processing pipeline instead of hiding everything behind a single **Scan** or **Generate** button.

### Generate

```text
Validate details
      ↓
Build payload string
      ↓
Encode QR image
      ↓
Verify round-trip decode
      ↓
Ready to download
```

### Decode

```text
Read input
      ↓
Locate QR code
      ↓
Decode payload
      ↓
Classify target type
      ↓
Extract fields
      ↓
Reveal destination
```

## 🏗️ Architecture

```text
┌─────────────────────┐
│   React Frontend    │
│                     │
│ Generate / Decode   │
│ Workflow UI         │
└──────────┬──────────┘
           │ HTTP API
           ▼
┌─────────────────────┐
│   FastAPI Backend   │
│                     │
│ Payload Processing  │
│ QR Encoding/Decode  │
│ Classification      │
│ Field Extraction    │
└─────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI |
| Language | Python |
| QR Processing | `qrcode` + OpenCV |
| API | REST |

## 📂 Project Structure

```text
scanflow/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── qr/
│   │   └── utils/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── hooks/
│   │   └── pages/
│   └── package.json
│
├── assets/
│   ├── 01-generate.png
│   ├── 02-generated-qr.png
│   ├── 03-scan-upload.png
│   └── 04-decoded-result.png
│
├── README.md
└── .gitignore
```

## 🚀 Run Locally

### Backend

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Start the API:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

API docs:

```text
http://127.0.0.1:8000/docs
```

## 🔍 Example Processing Log

```text
[VALIDATE] Image received
[LOCATE]   QR code found in image
[DECODE]   Payload extracted
[CLASSIFY] Target type detected
[EXTRACT]  Relevant fields parsed
[REVEAL]   Target revealed
```

The backend computes the actual result; the frontend controls how the workflow is revealed visually.

## 🔐 Safety Notes

- WiFi passwords are only revealed after a successful decode and are not used to auto-connect to a network.
- UPI QR codes produce a standard payment link; ScanFlow does not process payments.
- Decoding reads the QR payload and does not fetch or preview the destination automatically.
- A successfully decoded QR code is not automatically a safe QR code. Review destinations before opening them.

## 🎯 Project Goals

- Understand how QR payloads are structured.
- Separate image decoding from payload interpretation.
- Make the QR processing pipeline visible and understandable.
- Practice API design with FastAPI.
- Connect a React frontend to a Python backend.
- Build a project around the logic behind a familiar everyday technology.

## 📌 Future Improvements

- Camera-based live scanning
- QR history and scan logs
- More payload formats
- Suspicious URL detection
- Payload validation and sanitization
- Detailed QR metadata inspection
- Exportable scan reports
- Authentication and user-specific scan history

## 👩‍💻 Author

**Mumtaz Fatima**  
BE Computer Science & Engineering — AI & ML

GitHub: [@MumtazFatima-08](https://github.com/MumtazFatima-08)

---

**ScanFlow — understand the workflow behind the scan.**
