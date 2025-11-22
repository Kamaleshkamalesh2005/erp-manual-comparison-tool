import * as FileSaver from 'file-saver'
import ExcelJS from 'exceljs/dist/exceljs.min.js'

const COLORS = {
  matchCellFill: 'FFE2F3DA', // light green
  diffCellFill: 'FFF8D7DA',  // light red
  blackFont: 'FF000000',
}

// Export XLSX showing ALL ERP columns; color only compared cells
// - Green for equal values, Red for differing values
// - ERP-only columns (no manual match) stay uncolored
export async function exportToXlsx(comparison) {
  if (!comparison) return

  const workbook = new ExcelJS.Workbook()
  const ws = workbook.addWorksheet('Comparison')

  const columns = comparison.columns || []
  const headers = ['Index', ...columns]

  ws.addRow(headers)
  ws.getRow(1).font = { bold: true, color: { argb: COLORS.blackFont } }

  for (const r of comparison.rows || []) {
    const line = [r.index, ...columns.map(c => r?.[c] ?? '')]
    const excelRow = ws.addRow(line)

    // Always set black font for readability
    for (let i = 1; i <= headers.length; i++) {
      const cell = excelRow.getCell(i)
      cell.font = { color: { argb: COLORS.blackFont } }
    }

    // Color only compared cells using diff map
    const diff = r?.diff || {}
    for (let j = 0; j < columns.length; j++) {
      const colName = columns[j]
      if (!(colName in diff)) continue // ERP-only or not compared
      const isDifferent = !!diff[colName]
      const fillColor = isDifferent ? COLORS.diffCellFill : COLORS.matchCellFill
      const fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } }
      const cellIndex = 2 + j // 1: Index, 2..N: ERP columns
      const cell = excelRow.getCell(cellIndex)
      cell.fill = fill
      cell.font = { color: { argb: COLORS.blackFont } }
    }
  }

  headers.forEach((h, idx) => {
    const col = ws.getColumn(idx + 1)
    const maxCellLength = Math.max(
      h.length,
      ...((comparison.rows || []).map(r => String(
        idx === 0 ? r.index :
        (r?.[columns[idx - 1]] ?? '')
      )).map(s => s.length)))
    col.width = Math.min(60, Math.max(10, maxCellLength + 2))
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  FileSaver.saveAs(blob, 'comparison_report.xlsx')
}
