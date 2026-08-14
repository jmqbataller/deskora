# Deskora

Deskora is a privacy-first browser toolkit for everyday office, document, media and IT work. It is built for GitHub + Vercel and keeps supported file processing on the user's device instead of uploading files to a Deskora storage server.

## Deskora 1.5

Deskora now uses a **React + TypeScript + Vite** source stack. The existing PDF, OCR, image, video, audio, office, file, IT, PWA and workspace features are preserved while the application source has moved from `.js` / `.jsx` to `.ts` / `.tsx`.

### Featured video tools

Deskora promotes its three most practical video utilities directly on the landing page and in the tool library:

- **Video Compressor** — browser-side FFmpeg compression with multiple quality presets, video preview and before/after file-size feedback.
- **Video Trimmer** — built-in video preview, start/end inputs, range controls and local MP4 export.
- **Video Playback Speed** — slow-motion and fast-motion presets from 0.25× through 4×, plus a custom speed option.

The Universal File Drop and Ctrl/Cmd + K palette also prioritize these actions whenever a video is selected or the user types phrases such as `compress video`, `trim video`, or `video playback speed`.

### Product workflow features

- Smart Dashboard with favorites, custom shortcuts, recent tools and local processing history
- Universal File Analyzer with contextual actions for PDF, image, video/audio, spreadsheets, ZIPs and generic files
- Tool Chaining 2.0 for multiple image or PDF operations in one pass
- Batch Processing Center for multi-file jobs and ZIP output
- Template & Preset Center with shareable/bookmarkable tool URLs
- Multi-file Workspace with desktop-style local tabs
- Ctrl/Cmd + K command palette with natural task phrases
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
- CSV Column Tool
- Inventory CSV Helper with per-row QR labels
- Asset Label Generator for office equipment
- Email List Cleaner
- Text Compare
- Text Toolkit
- Text Pattern Extractor
- Number Toolkit
- Unit Converter
- Date Calculator
- Percentage / Discount / Margin Calculator
- List Randomizer / Team Splitter
- QR and Barcode generation/scanning
- Wi-Fi QR Generator
- VAT Calculator
- Number to Words
- Workdays Calculator
- Live Meeting Transcriber where supported by the browser

### Image and printing tools

- Image Convert / Compress / Resize / Batch ZIP
- Image Crop & Rotate
- Document Photo Enhancer
- Image metadata cleanup
- Image ↔ Base64
- Photo Sheet Maker
- Poster Splitter to multi-page A4 PDF
- DPI / paper-size / ID-photo / date-stamp printing utilities

### Developer and IT utilities

- JSON tools
- JSON ↔ CSV Converter
- XML Formatter / Validator
- Regex Tester
- JWT Decoder
- URL Encoder / Decoder / Parser
- Timestamp Converter
- UUID Generator
- MAC Address Formatter
- File Size Converter
- Color Converter
- IPv4/Subnet Calculator
- Password Generator
- Expanded IT & Security utilities for DHCP, DNS, VLAN, Windows support, printers, SMB, RDP, Wi-Fi, storage, power and helpdesk work

### Other media and file tools

- Social video resize
- Video frame extraction
- Video to GIF
- Video to MP3
- Audio Studio
- Watermark Center
- ZIP Create / Extract
- Smart Batch Rename
- Bulk File Organizer
- Exact Duplicate File Finder
- File Hash and File Compare

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

`vercel.json` contains the SPA rewrite required for direct routes such as `/tools/video-compressor`, `/tools/video-trim`, `/tools/video-speed`, `/tools/pdf-editor-pro` and `/tools/pipeline-center`.

## Stack

- React + TypeScript + Vite
- PDF.js + pdf-lib
- Tesseract.js
- FFmpeg.wasm
- SheetJS
- JSZip
- QRCode + bwip-js
- Lucide icons

## License

For the repository owner to define.
