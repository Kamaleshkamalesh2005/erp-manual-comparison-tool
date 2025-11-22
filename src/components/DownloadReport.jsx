import React from 'react'
import { exportToXlsx } from '../utils/exportXlsx'

export default function DownloadReport({ comparison, disabled }) {
  const onDownload = async () => {
    if (!comparison) return
    try {
      await exportToXlsx(comparison)
    } catch (err) {
      alert('Failed to generate XLSX: ' + (err?.message || String(err)))
    }
  }

  return (
    <button className="btn" onClick={onDownload} disabled={disabled}>
      Download Comparison Report (XLSX)
    </button>
  )
}
