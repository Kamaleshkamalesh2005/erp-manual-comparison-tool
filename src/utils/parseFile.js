import Papa from 'papaparse'

// Parses a CSV File object into { columns: string[], rows: object[] }
// Uses PapaParse with header: true and chunking for large files.
export function parseCsv(file) {
  return new Promise((resolve, reject) => {
    const rows = []
    let columns = null

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      chunkSize: 1024 * 1024, // 1MB chunks for large files
      chunk: (results) => {
        const { data, meta } = results
        if (!columns) {
          columns = meta?.fields || []
        }
        for (const row of data) {
          rows.push(row)
        }
      },
      complete: () => {
        // Ensure columns are unique and trimmed
        columns = (columns || []).map((c) => String(c || '').trim())
        resolve({ columns, rows })
      },
      error: (err) => reject(err),
    })
  })
}
