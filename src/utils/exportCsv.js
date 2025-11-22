// Export comparison to CSV format
// Output columns: row,column,value1,value2,status

function escapeCsvValue(v) {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) {
    return '"' + s.replaceAll('"', '""') + '"'
  }
  return s
}

export function exportComparisonToCsv(comparison) {
  if (!comparison) return ''
  const lines = ['row,column,value1,value2,status']

  for (const r of comparison.rows) {
    for (const c of comparison.columns) {
      const cell = r.cells[c] || { value1: '', value2: '', same: true }
      const status = cell.same ? 'SAME' : 'DIFFERENT'
      lines.push([
        r.index,
        escapeCsvValue(c),
        escapeCsvValue(cell.value1),
        escapeCsvValue(cell.value2),
        status,
      ].join(','))
    }
  }

  return lines.join('\n')
}
