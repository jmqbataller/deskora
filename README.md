# Deskora

Deskora is a privacy-first browser toolkit for everyday office, document, media and IT work. It is built for GitHub + Vercel and keeps supported file processing on the user's device instead of uploading files to a Deskora storage server.

## Deskora 1.2 productivity suite

### Product workflow features

- Smart Dashboard with favorites, custom shortcuts, recent tools and local processing history
- Universal File Analyzer with contextual actions for PDF, image, video/audio, spreadsheets, ZIPs and generic files
- Tool Chaining 2.0 for multiple image or PDF operations in one pass
- Batch Processing Center for multi-file jobs and ZIP output
- Template & Preset Center with shareable/bookmarkable tool URLs
- Multi-file Workspace with desktop-style local tabs
- Ctrl/Cmd + K command palette with task phrases such as `compress pdf 5mb` and `scan receipt`
- Dark mode
- PWA install support, offline caching for visited same-origin assets and update notification
- Share button on every tool page

### PDF and document tools

- PDF to Images
- Images to PDF
- Edit PDF
- PDF Editor Pro: text, checks, highlights, rectangles and signature/image placement
- PDF Form Filler
- PDF Page Organizer
- PDF Compressor
- Target Size Compression for PDF/image files
- Permanent PDF Redaction
- PDF to editable text / Word-compatible output
- PDF metadata cleanup
- Scan to Searchable PDF
- Merge, Split and Rotate PDF
- Batch PDF watermark/rotate operations
- Camera Scanner
- OCR / Image to Text
- OCR Correction Workspace
- Signature Maker

### Office and data tools

- Receipt Scanner
- Receipt Expense Workspace with editable fields and XLSX export
- Business Card Scanner
- CSV/Excel Cleaner
- Spreadsheet Duplicate Finder
- Spreadsheet Compare
- Excel / CSV Merge
- Excel Splitter
- Inventory CSV Helper with per-row QR labels
- Asset Label Generator for office equipment
- Email List Cleaner
- Text Compare
- QR and Barcode generation/scanning
- VAT Calculator
- Number to Words
- Workdays Calculator
- Live Meeting Transcriber where supported by the browser

### Media, image and file tools

- Image Convert / Compress / Resize / Batch ZIP
- Image metadata cleanup
- Video Compress / Speed / Trim / Video to MP3
- Social video resize
- Video frame extraction
- Video to GIF
- Audio Studio
- Watermark Center
- ZIP Create / Extract
- Smart Batch Rename
- Bulk File Organizer
- Exact Duplicate File Finder
- File Hash and File Compare
- IPv4/Subnet Calculator and Password Generator
- JSON and Base64 tools
- DPI / paper-size / ID-photo / date-stamp printing utilities

## Privacy architecture

Deskora is browser-first. Supported tools process data in the browser. Favorites, recent tools, presets, history and shortcuts use local browser storage. There is no Deskora account database or Deskora file-storage backend in this release.

OCR uses Tesseract.js. Video and audio processing use FFmpeg.wasm. PDF work uses PDF.js and pdf-lib.

## Important limitations

- Browser-side video, OCR and large PDF jobs depend on device memory/CPU and may be slower than native desktop software.
- Target-size compression aims near the requested size; exact byte size cannot be guaranteed for every file.
- PDF raster compression and permanent redaction flatten pages, which intentionally removes/loses the original selectable text layer.
- Standard encrypted PDF creation is not implemented because the current pdf-lib stack does not provide standard password-encryption support.
- Tool Chaining 2.0 currently runs image and PDF pipelines in one pass. Video chains stay as individual jobs to avoid exhausting browser memory on typical office devices.

## Local development

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Import `jmqbataller/deskora` into Vercel.
2. Framework preset: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. No environment variables are required for the browser-only toolset.
6. Deploy.

`vercel.json` contains the SPA rewrite required for direct routes such as `/tools/pdf-editor-pro` and `/tools/pipeline-center`.

## Stack

- React + Vite
- PDF.js + pdf-lib
- Tesseract.js
- FFmpeg.wasm
- SheetJS
- JSZip
- QRCode + bwip-js
- Lucide icons

## License

For the repository owner to define.
