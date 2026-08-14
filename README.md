# Deskora

Deskora is a privacy-first browser toolkit for everyday office and IT work. It combines PDF, image, video, spreadsheet, file, network, developer, QR/barcode, and printing utilities in one responsive interface.

## Current tools

- PDF to Images, Images to PDF, Merge PDF, Split PDF, Rotate PDF
- Image Convert, Compress, Resize, Batch Image ZIP
- Video Compress, Speed, Trim, Video to MP3 (browser FFmpeg)
- CSV/Excel Cleaner, Text Compare, Email List Cleaner
- QR Generator, Code 128 Barcode Generator
- Create ZIP, Extract ZIP, SHA-256 File Hash, Compare Files
- IPv4/Subnet Calculator, Password Generator
- JSON Formatter/Minifier, Base64 Encoder/Decoder
- DPI Calculator, Paper Size Guide

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

`vercel.json` includes an SPA rewrite so routes such as `/tools/pdf-to-image` load correctly when opened directly.

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
