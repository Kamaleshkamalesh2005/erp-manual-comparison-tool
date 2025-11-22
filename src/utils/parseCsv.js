import Papa from 'papaparse'
import * as XLSX from 'xlsx'

// Ensure headers are unique while preserving order
function uniqueHeaders(headers) {
  const seen = new Map()
  return headers.map((raw) => {
    const base = String(raw || '').trim()
    let name = base || ''
    if (!name) name = 'column'
    let final = name
    let i = 1
    while (seen.has(final)) {
      i += 1
      final = `${name}_${i}`
    }
    seen.set(final, true)
    return final
  })
}

// Parse CSV or XLSX/XLS File objects into { columns: string[], rows: object[] }
// - Detects file type by extension
// - CSV via PapaParse (header: true) with unique header normalization
// - XLSX/XLS via SheetJS (xlsx) with unique header normalization
// - Returns rows strictly based on sheet headers; skips empty rows
export async function parseCsv(file) {
  if (!file) throw new Error('No file provided')
  const name = (file.name || '').toLowerCase()

  if (name.endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      const rows = []
      let columns = null
      const seen = new Map()
      const makeUnique = (header) => {
        const base = String(header || '').trim()
        let name = base || ''
        if (!name) name = 'column'
        let final = name
        let i = 1
        while (seen.has(final)) {
          i += 1
          final = `${name}_${i}`
        }
        seen.set(final, true)
        return final
      }

      Papa.parse(file, {
        header: true,
        transformHeader: makeUnique,
        skipEmptyLines: true,
        worker: true,
        chunkSize: 1024 * 1024,
        chunk: (results) => {
          const { data, meta } = results
          if (!columns) {
            columns = (meta?.fields || []).map((c) => String(c || '').trim())
          }
          for (const row of data) {
            const obj = {}
            for (const c of columns) {
              obj[c] = sanitizeCell(row[c])
            }
            if (!isEmptyRow(obj, columns)) rows.push(obj)
          }
        },
        complete: () => {
          resolve({ columns: columns || [], rows })
        },
        error: (err) => reject(err),
      })
    })
  }

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const sheetName = wb.SheetNames[0]
    const ws = wb.Sheets[sheetName]
    const rowsAoa = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false })
    const rawHeaders = (rowsAoa[0] || []).map((c) => String(c || '').trim())
    const headers = uniqueHeaders(rawHeaders)
    const rows = []
    for (let i = 1; i < rowsAoa.length; i++) {
      const rowArr = rowsAoa[i] || []
      const obj = {}
      for (let j = 0; j < headers.length; j++) {
        const c = headers[j]
        obj[c] = sanitizeCell(rowArr[j])
      }
      if (!isEmptyRow(obj, headers)) rows.push(obj)
    }
    return { columns: headers, rows }
  }

  throw new Error('Unsupported file type. Please upload .csv, .xlsx, or .xls')
}

function sanitizeCell(value) {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

function isEmptyRow(obj, columns) {
  return columns.every((c) => (obj[c] === '' || obj[c] === null || obj[c] === undefined))
}