// Synonym mapping and normalization helpers for ERP↔Manual column matching
// - Normalize names by lowercasing and removing spaces/underscores/punctuation
// - Provide a mapping of common ERP/manual synonyms
// - Export functions to build ERP→Manual column match map and choose primary key

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // remove spaces, underscores, hyphens, punctuation
}

// Canonical key -> set of synonyms (all normalized)
const SYNONYMS = {
  id: new Set(['id', 'recordid', 'itemid', 'entryid', 'userid', 'employeeid', 'sku', 'code', 'ref', 'reference']),
  sku: new Set(['sku', 'productsku', 'itemsku', 'code', 'productcode']),
  name: new Set(['name', 'fullname', 'productname', 'itemname']),
  description: new Set(['description', 'desc']),
  quantity: new Set(['quantity', 'qty', 'count', 'units']),
  price: new Set(['price', 'unitprice', 'cost']),
  total: new Set(['total', 'amount', 'sum', 'subtotal']),
  date: new Set(['date', 'txndate', 'transactiondate', 'createddate']),
  status: new Set(['status', 'state']),
}

// Build lookup of manual columns by normalized name
function buildManualLookup(manualColumns) {
  const lookup = new Map()
  for (const col of manualColumns || []) {
    const norm = normalizeName(col)
    lookup.set(norm, col) // keep original manual column value
  }
  return lookup
}

// Return best matching manual column for a given ERP column using synonyms and normalization
function matchManualColumn(erpCol, manualColumns) {
  const erpNorm = normalizeName(erpCol)
  const manualLookup = buildManualLookup(manualColumns)

  // 1) direct normalized match
  if (manualLookup.has(erpNorm)) return manualLookup.get(erpNorm)

  // 2) synonyms: find canonical whose set contains erpNorm, then any manual that matches set
  for (const [canonical, synSet] of Object.entries(SYNONYMS)) {
    if (synSet.has(erpNorm)) {
      // try manual columns that match any synonym in this set
      for (const syn of synSet) {
        if (manualLookup.has(syn)) return manualLookup.get(syn)
      }
      // also the canonical name itself
      const canonicalNorm = normalizeName(canonical)
      if (manualLookup.has(canonicalNorm)) return manualLookup.get(canonicalNorm)
    }
  }

  // 3) no match found
  return null
}

// Build mapping { erpCol: manualCol|null } for all ERP columns
export function mapErpToManualColumns(erpColumns = [], manualColumns = []) {
  const mapping = {}
  for (const c of erpColumns) {
    mapping[c] = matchManualColumn(c, manualColumns)
  }
  return mapping
}

// Choose primary key from ERP columns using synonyms; fallback to first column
export function choosePrimaryKey(erpColumns = []) {
  const candidates = ['id', 'sku', 'code', 'ref']
  const normalizedSet = new Set(erpColumns.map((c) => normalizeName(c)))
  for (const cand of candidates) {
    const norm = normalizeName(cand)
    if (normalizedSet.has(norm)) {
      // find original column whose normalized equals this cand
      for (const c of erpColumns) {
        if (normalizeName(c) === norm) return c
      }
    }
    // also check synonyms sets
    const syn = SYNONYMS[cand]
    if (syn) {
      for (const s of syn) {
        if (normalizedSet.has(s)) {
          for (const c of erpColumns) {
            if (normalizeName(c) === s) return c
          }
        }
      }
    }
  }
  return erpColumns[0] || null
}

export function normalizeValue(v) {
  if (v === undefined || v === null) return ''
  return String(v).trim()
}