import fs from 'node:fs'

const read = path => fs.readFileSync(path, 'utf8')
const ids = text => [...text.matchAll(/\bid\s*:\s*['"]([^'"]+)['"]/g)].map(m => m[1])
const arrayBlock = (text,name) => text.match(new RegExp(`export const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\n\\]`))?.[1] || ''

const data = read('src/data-tools.ts')
const base = ids(arrayBlock(data,'tools'))
const productivity = ids(read('src/productivity-tools.ts'))
const featureUtility = ids(read('src/feature-pack-tools.ts'))
const it = ids(read('src/it-tools-pack-v2.ts'))
const all = [...base, ...productivity, ...featureUtility, ...it]
const duplicates = all.filter((id, i) => all.indexOf(id) !== i)

const app = read('src/App.tsx')
const componentBlock = app.match(/const toolComponents[^=]*=\s*\{([\s\S]*?)\n\}/)?.[1] || ''
const components = new Set([...componentBlock.matchAll(/['"]([^'"]+)['"]\s*:\s*[A-Za-z_$][\w$]*/g)].map(m => m[1]))
const nonIt = all.filter(id => !it.includes(id))
const missingComponents = nonIt.filter(id => !components.has(id))

const itEngine = read('src/tools/ITToolsV2.tsx')
const itCases = new Set([...itEngine.matchAll(/case\s*['"]([^'"]+)['"]/g)].map(m => m[1]))
const missingItCases = it.filter(id => !itCases.has(id))
const unknownItCases = [...itCases].filter(id => !it.includes(id))

const categories = new Set(ids(arrayBlock(data,'categories')))
const records = [arrayBlock(data,'tools'), read('src/productivity-tools.ts'), read('src/feature-pack-tools.ts'), read('src/it-tools-pack-v2.ts')].join('\n')
const categoryRefs = [...records.matchAll(/\bcategory\s*:\s*['"]([^'"]+)['"]/g)].map(m => m[1])
const badCategories = [...new Set(categoryRefs.filter(c => !categories.has(c)))]

const failures = []
if (duplicates.length) failures.push(`Duplicate tool IDs: ${[...new Set(duplicates)].join(', ')}`)
if (missingComponents.length) failures.push(`Catalog tools missing normal handlers: ${missingComponents.join(', ')}`)
if (missingItCases.length) failures.push(`IT tools missing ITToolEngine cases: ${missingItCases.join(', ')}`)
if (unknownItCases.length) failures.push(`ITToolEngine cases missing from catalog: ${unknownItCases.join(', ')}`)
if (badCategories.length) failures.push(`Unknown categories: ${badCategories.join(', ')}`)
console.log(`Deskora catalog QA: ${all.length} unique tool registrations inspected.`)
console.log(`Normal handlers: ${components.size}; IT engine cases: ${itCases.size}.`)
if (failures.length) { console.error('\n'+failures.map(x=>`- ${x}`).join('\n')); process.exit(1) }
console.log('PASS — catalog IDs, categories and handlers are consistent.')
