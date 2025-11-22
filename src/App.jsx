import React, { useMemo, useState } from 'react'
import FileUpload from './components/FileUpload'
import ComparisonTable from './components/ComparisonTable'
import DownloadReport from './components/DownloadReport'
import { parseCsv } from './utils/parseCsv'
import { compareCsv } from './utils/compareCsv'

export default function App() {
  const [file1Data, setFile1Data] = useState(null)
  const [file2Data, setFile2Data] = useState(null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const comparison = useMemo(() => {
    if (!file1Data || !file2Data) return null
    return compareCsv(file1Data, file2Data)
  }, [file1Data, file2Data])

  const handleUpload = async (file, which) => {
    if (!file) return
    if (which === 1) setLoading1(true)
    if (which === 2) setLoading2(true)
    try {
      const parsed = await parseCsv(file)
      if (which === 1) setFile1Data(parsed)
      else setFile2Data(parsed)
    } catch (err) {
      alert('Failed to parse file: ' + err.message)
    } finally {
      if (which === 1) setLoading1(false)
      if (which === 2) setLoading2(false)
    }
  }

  const resetAll = () => {
    setFile1Data(null)
    setFile2Data(null)
  }

  return (
    <div className="container">
      <header className="header">
        <div className="title">ERP vs Manual Comparison</div>
        <button className="btn secondary" onClick={resetAll}>Reset</button>
      </header>

      <section className="cards">
        <div className="card">
          <h3>Upload ERP (File 1)</h3>
          <FileUpload onFile={(f) => handleUpload(f, 1)} loading={loading1} />
          <div className="spacer" />
          <div className="muted">Accepts .csv, .xlsx, .xls. All ERP columns preserved.</div>
        </div>
        <div className="card">
          <h3>Upload Manual (File 2)</h3>
          <FileUpload onFile={(f) => handleUpload(f, 2)} loading={loading2} />
          <div className="spacer" />
          <div className="muted">Columns are matched via synonyms; manual-only columns are ignored.</div>
        </div>
        <div className="card">
          <h3>Report</h3>
          <DownloadReport comparison={comparison} disabled={!comparison} />
          <div className="spacer" />
          <div className="muted">XLSX shows all ERP columns; only matched cells colored.</div>
        </div>
      </section>

      <section className="table-wrap">
        {(!file1Data || !file2Data) && (
          <div className="empty">Upload ERP and Manual files to see comparison.</div>
        )}
        {file1Data && file2Data && (
          <ComparisonTable comparison={comparison} />
        )}
      </section>

      <footer className="footer">
        <div className="badge">ERP rows: {file1Data?.rows?.length ?? 0}</div>
        <div className="badge">Manual rows: {file2Data?.rows?.length ?? 0}</div>
        <div className="badge">ERP columns: {comparison?.columns?.length ?? 0}</div>
      </footer>
    </div>
  )
}
