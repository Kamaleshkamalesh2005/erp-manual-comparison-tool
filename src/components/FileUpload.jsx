import React, { useRef } from 'react'

export default function FileUpload({ onFile, loading }) {
  const inputRef = useRef(null)

  const onChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const name = (file.name || '').toLowerCase()
    const valid = name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls')
    if (!valid) {
      alert('Invalid file type. Please select a .csv, .xlsx, or .xls file.')
      e.target.value = ''
      return
    }
    onFile(file)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={onChange}
        style={{ display: 'none' }}
      />
      <button className="btn" onClick={() => inputRef.current?.click()} disabled={loading}>
        {loading ? (<span className="spinner" />) : null}
        {loading ? 'Parsing…' : 'Choose File'}
      </button>
    </div>
  )
}
