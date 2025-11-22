// ERP vs Manual comparison that returns per-cell diff only for matched columns
// - Output columns: ALL ERP (File1) columns
// - Compare only columns that exist in BOTH files via synonym mapping
// - diff[column] = true|false for matched columns (true = different, false = equal)
// - No row-level status; manual-only columns are not added

import { mapErpToManualColumns, choosePrimaryKey, normalizeValue } from './columnNameMap'

export function compareCsv(csvErp, csvManual) {
  const erpColumns = Array.isArray(csvErp?.columns) ? [...csvErp.columns] : []
  const manualColumns = Array.isArray(csvManual?.columns) ? [...csvManual.columns] : []
  if (erpColumns.length === 0) return { columns: [], rows: [] }

  const pkErp = choosePrimaryKey(erpColumns)
  const columnMap = mapErpToManualColumns(erpColumns, manualColumns) // { erpCol: manualCol|null }
  const pkManual = columnMap[pkErp] || null

  // Build manual row map keyed by manual PK (if available)
  const manualMap = new Map()
  if (pkManual) {
    for (const r of csvManual?.rows || []) {
      const key = normalizeValue(r?.[pkManual])
      if (key) manualMap.set(key, r)
    }
  }

  const rowsOut = []
  let index = 1
  for (const r1 of csvErp?.rows || []) {
    const out = { index: index++ }
    // Always include all ERP columns
    for (const c of erpColumns) {
      out[c] = normalizeValue(r1?.[c])
    }

    const diff = {}
    // If we have manual PK and a matching manual row, compare matched columns
    let r2 = null
    if (pkManual) {
      const keyErp = normalizeValue(r1?.[pkErp])
      if (keyErp) r2 = manualMap.get(keyErp) || null
    }

    if (r2) {
      for (const erpCol of erpColumns) {
        const manualCol = columnMap[erpCol]
        if (!manualCol) continue // ERP-only column: not compared
        const v1 = normalizeValue(r1?.[erpCol])
        const v2 = normalizeValue(r2?.[manualCol])
        diff[erpCol] = (v1 !== v2)
      }
    }

    if (Object.keys(diff).length > 0) out.diff = diff
    rowsOut.push(out)
  }

  return { columns: erpColumns, rows: rowsOut }
}
