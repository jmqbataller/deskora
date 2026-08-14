# Deskora

Deskora is a privacy-first browser toolkit for everyday office and IT work. It combines PDF, document scanning, image, video, spreadsheet, file, network, developer, QR/barcode, and printing utilities in one responsive interface.

## Current tools

- PDF to Images, Edit PDF, Images to PDF, Merge PDF, Split PDF, Rotate PDF
- Camera Scanner with camera/upload capture, auto crop, scan filters, deskew, multi-page PDF export
- Image Convert, Compress, Resize, Batch Image ZIP
- Video Compress, Speed, Trim, Video to MP3 (browser FFmpeg)
- CSV/Excel Cleaner, Text Compare, Email List Cleaner
- QR Generator, Code 128 Barcode Generator
- Create ZIP, Extract ZIP, SHA-256 File Hash, Compare Files
- IPv4/Subnet Calculator, Password Generator
- JSON Formatter/Minifier, Base64 Encoder/Decoder
- DPI Calculator, Paper Size Guide

### Edit PDF

The visual PDF editor can add positioned text and signature/image overlays to any page, undo/clear page edits, preview the result, and export a new edited PDF. It does not rewrite the original embedded PDF text objects; edits are applied as new PDF content layers.

### Camera Scanner

The scanner can use the device camera or an uploaded photo, detect/crop document edges, apply enhanced color, grayscale or black-and-white scan modes, adjust brightness/contrast, deskew/rotate, collect multiple scanned pages, and export JPG, PNG or a multi-page A4 PDF.

## Privacy architecture

Deskora is designed as a browser-first app. Supported file operations run on the user's device. There is no database, account system, or Deskora file-storage backend in this release.

Video processing uses a browser build of FFmpeg. The FFmpeg runtime is copied from `@ffmpeg/core` into the static Vercel build during `npm install`, so the deployed app can serve it from the same origin.

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Vercel should detect Vite automatically.
3. Build command: `npm run build`
4. Output directory: `dist`
5. No environment variables are required for V1.
6. Deploy.

`vercel.json` includes an SPA rewrite so routes such as `/tools/pdf-to-image`, `/tools/edit-pdf`, and `/tools/camera-scanner` load correctly when opened directly.

## Stack

- React + Vite
- pdf-lib + PDF.js
- FFmpeg.wasm
- SheetJS
- JSZip
- QRCode
- bwip-js
- Lucide icons

## License

For the repository owner to define.
