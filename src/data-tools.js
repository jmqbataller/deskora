import {
  FileText, Images, Image, Film, FileSpreadsheet, Type, QrCode,
  Archive, Network, Code2, Printer, Hash, FileStack,
  Gauge, Crop, RotateCw, Merge, Scissors, FileImage, FileAudio, Sparkles,
  Table2, ListChecks, Binary, KeyRound, Calculator, Barcode, PackageOpen,
  Camera, FilePenLine,
} from 'lucide-react'

export const categories = [
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'video', label: 'Video', icon: Film },
  { id: 'office', label: 'Office', icon: FileSpreadsheet },
  { id: 'file', label: 'File', icon: Archive },
  { id: 'it', label: 'IT & Security', icon: Network },
  { id: 'developer', label: 'Developer', icon: Code2 },
  { id: 'printing', label: 'Printing', icon: Printer },
]

export const tools = [
  { id:'pdf-to-image', name:'PDF to Images', desc:'Export PDF pages as PNG, JPG or WebP.', category:'pdf', icon:FileImage, badge:'Popular' },
  { id:'edit-pdf', name:'Edit PDF', desc:'Add text, signatures and images visually, then export a new PDF.', category:'pdf', icon:FilePenLine, badge:'New' },
  { id:'images-to-pdf', name:'Images to PDF', desc:'Combine browser-supported images into one PDF.', category:'pdf', icon:Images },
  { id:'merge-pdf', name:'Merge PDF', desc:'Combine multiple PDF files in your chosen order.', category:'pdf', icon:Merge },
  { id:'split-pdf', name:'Split PDF', desc:'Extract page ranges into a new PDF.', category:'pdf', icon:Scissors },
  { id:'rotate-pdf', name:'Rotate PDF', desc:'Rotate every page clockwise and export a new copy.', category:'pdf', icon:RotateCw },

  { id:'convert-image', name:'Convert Image', desc:'Convert JPG, PNG and WebP formats locally.', category:'image', icon:Sparkles, badge:'Popular' },
  { id:'compress-image', name:'Compress Image', desc:'Reduce image size with quality control.', category:'image', icon:Gauge },
  { id:'resize-image', name:'Resize Image', desc:'Resize to exact pixel dimensions.', category:'image', icon:Crop },
  { id:'batch-images', name:'Batch Image ZIP', desc:'Convert or compress multiple images and download a ZIP.', category:'image', icon:FileStack },

  { id:'video-compressor', name:'Video Compressor', desc:'Compress videos in your browser with FFmpeg.', category:'video', icon:Film, badge:'FFmpeg' },
  { id:'video-speed', name:'Video Speed', desc:'Create fast-motion or slow-motion video.', category:'video', icon:Gauge, badge:'FFmpeg' },
  { id:'video-trim', name:'Trim Video', desc:'Cut a video by start and end time.', category:'video', icon:Scissors, badge:'FFmpeg' },
  { id:'video-audio', name:'Video to MP3', desc:'Extract audio from a video file.', category:'video', icon:FileAudio, badge:'FFmpeg' },

  { id:'camera-scanner', name:'Camera Scanner', desc:'Capture paper documents, clean them up and export a scan-ready PDF.', category:'office', icon:Camera, badge:'New' },
  { id:'csv-cleaner', name:'CSV Cleaner', desc:'Remove blank and duplicate rows from CSV or Excel data.', category:'office', icon:Table2 },
  { id:'text-compare', name:'Text Compare', desc:'Highlight additions and removals between two texts.', category:'office', icon:Type },
  { id:'email-cleaner', name:'Email List Cleaner', desc:'Normalize, validate and deduplicate email lists.', category:'office', icon:ListChecks },
  { id:'qr-generator', name:'QR Generator', desc:'Generate QR codes for URLs, text or Wi-Fi details.', category:'office', icon:QrCode },
  { id:'barcode-generator', name:'Barcode Generator', desc:'Generate printable Code 128 barcodes.', category:'office', icon:Barcode },

  { id:'zip-creator', name:'Create ZIP', desc:'Package multiple files into a ZIP archive.', category:'file', icon:Archive },
  { id:'zip-extractor', name:'Extract ZIP', desc:'Open a ZIP and download individual files.', category:'file', icon:PackageOpen },
  { id:'file-hash', name:'File Hash', desc:'Generate SHA-256 fingerprints locally.', category:'file', icon:Hash },
  { id:'file-compare', name:'Compare Files', desc:'Check whether two files are byte-for-byte identical.', category:'file', icon:Binary },

  { id:'subnet-calculator', name:'IP / Subnet Calculator', desc:'Calculate network, broadcast and usable IPv4 range.', category:'it', icon:Network, badge:'Office IT' },
  { id:'password-generator', name:'Password Generator', desc:'Generate secure passwords without sending data anywhere.', category:'it', icon:KeyRound },

  { id:'json-tools', name:'JSON Tools', desc:'Format, minify and validate JSON.', category:'developer', icon:Code2 },
  { id:'base64-tools', name:'Base64 Encoder', desc:'Encode and decode text using Base64.', category:'developer', icon:Binary },

  { id:'dpi-calculator', name:'DPI Calculator', desc:'Convert print size and DPI into exact pixel dimensions.', category:'printing', icon:Calculator },
  { id:'paper-size', name:'Paper Size Guide', desc:'Instant dimensions for A-series, Letter and Legal paper.', category:'printing', icon:Printer },
]

export const toolMap = Object.fromEntries(tools.map(t => [t.id, t]))
