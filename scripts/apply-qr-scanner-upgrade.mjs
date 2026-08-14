import fs from 'node:fs'

function mustReplace(path, from, to){
  const before=fs.readFileSync(path,'utf8')
  if(!before.includes(from)) throw new Error(`Expected text not found in ${path}`)
  fs.writeFileSync(path,before.replace(from,to))
}

mustReplace(
  'src/App.tsx',
  "import { SpreadsheetDuplicateFinder, SpreadsheetCompare, ExcelMerge, ExcelSplitter, SmartRename, BulkOrganizer, DuplicateFileFinder, ImageMetadataCleaner, NumberToWords, VatCalculator, WorkdaysCalculator, CodeScanner, MeetingTranscriber } from './tools/OfficeExpansion'",
  "import { SpreadsheetDuplicateFinder, SpreadsheetCompare, ExcelMerge, ExcelSplitter, SmartRename, BulkOrganizer, DuplicateFileFinder, ImageMetadataCleaner, NumberToWords, VatCalculator, WorkdaysCalculator, MeetingTranscriber } from './tools/OfficeExpansion'\nimport { CodeScanner } from './tools/QrBarcodeScanner'"
)

mustReplace(
  'src/data-tools.ts',
  "{ id:'code-scanner', name:'QR & Barcode Scanner', desc:'Read QR and common barcode formats from a photo or phone camera.', category:'office', icon:Barcode }",
  "{ id:'code-scanner', name:'QR & Barcode Scanner', desc:'Scan from images, live camera or PDA handheld scanners, then copy all results.', category:'office', icon:Barcode, badge:'Upgraded' }"
)

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'))
pkg.version='1.5.3'
pkg.dependencies['@zxing/browser']='^0.2.1'
pkg.dependencies['@zxing/library']='^0.23.0'
const ordered={...pkg,dependencies:Object.fromEntries(Object.entries(pkg.dependencies).sort(([a],[b])=>a.localeCompare(b)))}
fs.writeFileSync('package.json',JSON.stringify(ordered,null,2)+'\n')
console.log('QR scanner upgrade wiring applied.')
