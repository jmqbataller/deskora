import { Image, Crop, Printer, Type, Calculator, Network, Code2, Binary, FileText, Sparkles, Table2, ListChecks, Hash, QrCode, KeyRound, FileSpreadsheet, Clock, Palette } from 'lucide-react'
import { itToolsV2 } from './it-tools-pack-v2'

const utilityFeatureTools = [
  { id:'image-crop-rotate', name:'Image Crop & Rotate', desc:'Crop by coordinates or rotate an image and export PNG or JPG.', category:'image', icon:Crop, badge:'New' },
  { id:'document-enhancer', name:'Document Photo Enhancer', desc:'Clean photographed documents with grayscale, contrast and black-and-white scan filters.', category:'image', icon:Sparkles, badge:'Office' },
  { id:'photo-sheet', name:'Photo Sheet Maker', desc:'Arrange one photo into a printable A4 contact sheet with configurable copies.', category:'printing', icon:Printer },
  { id:'poster-splitter', name:'Poster Splitter', desc:'Split one large image across multiple printable A4 PDF pages.', category:'printing', icon:Printer, badge:'New' },
  { id:'text-toolkit', name:'Text Toolkit', desc:'Case conversion, whitespace cleanup, duplicate-line removal, sorting and counts.', category:'office', icon:Type, badge:'Popular' },
  { id:'json-csv', name:'JSON ↔ CSV Converter', desc:'Convert JSON arrays to CSV and CSV data back to JSON.', category:'developer', icon:Table2 },
  { id:'xml-tools', name:'XML Formatter', desc:'Format, validate and compact XML in the browser.', category:'developer', icon:Code2 },
  { id:'regex-tester', name:'Regex Tester', desc:'Test regular expressions with flags and inspect every match.', category:'developer', icon:Code2 },
  { id:'jwt-decoder', name:'JWT Decoder', desc:'Decode JWT header and payload locally without validating or sending the token.', category:'developer', icon:KeyRound },
  { id:'url-tools', name:'URL Encoder & Parser', desc:'Encode, decode and inspect URL components and query parameters.', category:'developer', icon:Code2 },
  { id:'timestamp-converter', name:'Timestamp Converter', desc:'Convert Unix timestamps to local/UTC dates and dates back to Unix time.', category:'developer', icon:Clock },
  { id:'uuid-generator', name:'UUID Generator', desc:'Generate one or many cryptographically random UUID v4 identifiers.', category:'developer', icon:Hash },
  { id:'image-base64', name:'Image ↔ Base64', desc:'Convert image files to data URLs or Base64 strings and decode them back.', category:'developer', icon:Binary },
  { id:'mac-formatter', name:'MAC Address Formatter', desc:'Normalize MAC addresses to colon, dash or Cisco dotted notation.', category:'it', icon:Network },
  { id:'file-size-converter', name:'File Size Converter', desc:'Convert bytes, KB, MB, GB and TB using decimal or binary units.', category:'file', icon:Calculator },
  { id:'unit-converter', name:'Unit Converter', desc:'Convert length, weight, temperature, area and storage units.', category:'office', icon:Calculator },
  { id:'date-calculator', name:'Date Calculator', desc:'Calculate date differences or add and subtract days from a date.', category:'office', icon:Clock },
  { id:'percentage-calculator', name:'Percentage & Margin Calculator', desc:'Calculate percentages, discounts, markup, margin and percent change.', category:'office', icon:Calculator },
  { id:'list-randomizer', name:'List Randomizer', desc:'Shuffle names, pick random entries or split a list into teams.', category:'office', icon:ListChecks },
  { id:'color-converter', name:'Color Converter', desc:'Convert HEX, RGB and HSL values and preview the result.', category:'developer', icon:Palette },
  { id:'csv-column-tool', name:'CSV Column Tool', desc:'Select or remove columns from CSV/Excel data and export a cleaned workbook.', category:'office', icon:FileSpreadsheet },
  { id:'wifi-qr', name:'Wi-Fi QR Generator', desc:'Create a QR code that can join a Wi-Fi network from SSID and password.', category:'office', icon:QrCode },
  { id:'number-tools', name:'Number Toolkit', desc:'Average, sum, min, max, ratio and sorted statistics from pasted numbers.', category:'office', icon:Calculator },
  { id:'text-extractor', name:'Text Pattern Extractor', desc:'Extract emails, URLs, phone-like numbers or numeric values from pasted text.', category:'office', icon:FileText },
]

// IT & Security is part of the same /tools catalog as every other Deskora category.
// Keep utilityFeatureTools first so existing homepage feature ordering remains stable.
export const featurePackTools = [...utilityFeatureTools, ...itToolsV2]
