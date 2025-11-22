import React, { useMemo } from 'react'

export default function ComparisonTable({ comparison }) {
  const { columns, rows } = comparison || { columns: [], rows: [] }

  const header = useMemo(() => (
    <thead>
      <tr>
        <th style={{ minWidth: 60 }}>Index</th>
        {columns.map((c) => (
          <th key={`c-${c}`}>{c}</th>
        ))}
      </tr>
    </thead>
  ), [columns])

  return (
    <table>
      {header}
      <tbody>
        {rows.map((r) => (
          <tr key={r.index}>
            <td>{r.index}</td>
            {columns.map((c) => {
              const compared = r?.diff && c in r.diff
              const isDiff = compared ? !!r.diff[c] : null
              const cls = compared ? (isDiff ? 'cell-different' : 'cell-match') : ''
              return (
                <td key={`v-${r.index}-${c}`} className={cls}>{r?.[c] ?? ''}</td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
