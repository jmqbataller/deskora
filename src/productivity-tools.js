import { FileText, Merge, FileStack, Type, Printer, Table2, Gauge, Archive, Sparkles, Calculator, Images, FilePenLine } from 'lucide-react'

export const productivityTools = [
  { id:'file-analyzer', name:'Universal File Analyzer', desc:'Inspect type, size, hash, pages, dimensions, duration or spreadsheet structure, then open compatible actions.', category:'file', icon:FileText, badge:'New' },
  { id:'pipeline-center', name:'Tool Chaining 2.0', desc:'Run multiple image or PDF operations in one pass without intermediate downloads.', category:'office', icon:Merge, badge:'Flagship' },
  { id:'batch-center', name:'Batch Processing Center', desc:'Process many compatible files with one rule and package the output in a ZIP.', category:'file', icon:Archive, badge:'New' },
  { id:'target-compression', name:'Target Size Compression', desc:'Compress images or PDFs toward a requested KB/MB target with before-and-after metrics.', category:'pdf', icon:Gauge, badge:'New' },
  { id:'pdf-editor-pro', name:'PDF Editor Pro', desc:'Add text, checks, highlights, rectangles and signatures in a visual multi-page editor.', category:'pdf', icon:FilePenLine, badge:'New' },
  { id:'ocr-workspace', name:'OCR Correction Workspace', desc:'View the source and recognized text side by side, correct it, then copy or export.', category:'office', icon:Type, badge:'OCR' },
  { id:'expense-workspace', name:'Receipt Expense Workspace', desc:'Scan multiple receipts into an editable expense table and export an Excel report.', category:'office', icon:Calculator, badge:'New' },
  { id:'asset-labels', name:'Asset Label Generator', desc:'Create printable office equipment labels with asset ID, department, serial and QR code.', category:'printing', icon:Printer, badge:'Office IT' },
  { id:'inventory-helper', name:'Inventory CSV Helper', desc:'Load inventory Excel/CSV data and generate one QR asset label per row.', category:'office', icon:Table2 },
  { id:'template-center', name:'Template & Preset Center', desc:'Open bookmarkable presets for scans, PDFs, ID photos, social video and office workflows.', category:'office', icon:Sparkles, badge:'New' },
  { id:'batch-pdf', name:'Batch PDF Operations', desc:'Watermark or rotate multiple PDFs in one operation and download a ZIP.', category:'pdf', icon:FileStack },
  { id:'multi-file-workspace', name:'Multi-file Workspace', desc:'Keep several local files open as tabs and jump directly to compatible actions.', category:'file', icon:Images, badge:'New' },
  { id:'smart-dashboard', name:'Smart Dashboard', desc:'Favorites, shortcuts, recent tools and local processing history in one home workspace.', category:'office', icon:FileStack, badge:'New' },
]
