# Deskora

Deskora is a privacy-first browser toolkit for everyday office, document, media and IT work. It is designed for GitHub + Vercel and performs supported file processing on the user's device instead of uploading files to a Deskora storage server.

## Deskora 1.1 toolset

### PDF & documents
- PDF to PNG/JPG/WebP
- Visual Edit PDF / form-filling workflow with text and signature/image overlays
- Images to PDF, Merge, Split, Rotate
- PDF Page Organizer: reorder, duplicate, rotate and delete pages
- PDF Compressor with quality/resolution presets
- Permanent PDF Redaction by flattening redacted pages
- PDF to editable text / Word-compatible `.doc`
- PDF metadata cleaner
- Scan photos to searchable PDF with OCR text layer
- Camera Scanner: camera/upload, auto crop, manual crop, deskew, filters, multi-page PDF

### OCR & office scanning
- Image / scanned-PDF OCR to editable text
- English and Filipino OCR language choices
- Receipt Scanner with likely amount/total line extraction
- Business Card Scanner with email/phone/URL extraction
- QR and barcode scanning where the browser supports `BarcodeDetector`
- QR generator and Code 128 barcode generator

### Images & printing
- Convert, compress, resize and batch image ZIP
- Image metadata / EXIF-GPS cleaner by re-encoding
- Signature Maker with transparent PNG output
- ID Picture A4 sheet for 1×1, 2×2 and passport sizing
- Date Stamp Generator
- A3/A4/A5, Letter, Legal, **Long Bond 8.5×13**, and Folio paper guide
- DPI calculator

### Video & audio
- Video compression, trimming, speed, Video → MP3
- Social video resize: 9:16, 4:5, 1:1 and 16:9
- Video frame extractor
- Video → GIF
- Watermark images, PDFs and videos
- Audio Studio: MP3 conversion, compression, trim, merge, speed, volume, normalization and silence removal

### Spreadsheet & office data
- CSV / Excel cleaner
- Spreadsheet duplicate finder
- Spreadsheet cell-by-cell compare with diff CSV
- Excel / CSV merge
- Excel splitter by selected column
- Text compare and email-list cleaner
- Number-to-words for Philippine peso documents
- VAT calculator
- Workdays calculator with optional custom holiday dates
- Live meeting transcription where browser speech recognition is available

### File, IT & developer tools
- ZIP create/extract
- SHA-256 hash and byte-for-byte file compare
- Smart batch rename into ZIP
- Bulk file organizer into categorized ZIP folders
- Exact duplicate file finder using SHA-256
- IPv4/subnet calculator
- Password generator
- JSON format/minify/validate
- Base64 encode/decode

## Workspace features
- Favorites stored in browser local storage
- Recent tools stored on the device
- `Ctrl/Cmd + K` command palette
- Universal file-drop action suggestions
- Guided Tool Chain Builder with saved local workflows
- Installable PWA shell and service-worker caching for visited same-origin assets

## Privacy architecture

Deskora has no account system, database or Deskora file-storage backend in this release. PDF, image, spreadsheet, archive and utility processing is browser-side. Video/audio uses FFmpeg.wasm served from the same Vercel origin. OCR uses Tesseract.js in the browser; its runtime/language assets may be fetched when first needed.

## Important limitations

- **Edit PDF** adds new content layers; it does not rewrite arbitrary original PDF text objects.
- **PDF compression** currently uses raster compression, so selectable text in the compressed copy is flattened.
- **Permanent redaction** intentionally rasterizes pages so covered underlying text is not retained as selectable PDF content.
- **Standard PDF password encryption/unlocking is not enabled yet.** The current `pdf-lib` dependency does not provide standard encrypted-PDF editing/encryption. Deskora does not create a fake proprietary wrapper and call it a protected PDF.
- Browser APIs such as `BarcodeDetector` and Speech Recognition vary by browser/device.
- Very large videos/audio files can be memory- and CPU-intensive because FFmpeg runs on the user's device.

## Development

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run build
npm run preview
```

A GitHub Actions workflow also runs `npm install` and `npm run build` on the feature branch and `main`.

## Deploy to Vercel

1. Import `jmqbataller/deskora` into Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. No app environment variables are required for the current browser-first toolset.
6. Deploy.

`vercel.json` provides the SPA rewrite for direct `/tools/...` routes.

## Stack

- React + Vite
- pdf-lib + PDF.js
- Tesseract.js OCR
- FFmpeg.wasm
- SheetJS
- JSZip
- QRCode + bwip-js
- Lucide icons

## License

For the repository owner to define.
