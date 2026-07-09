

const STORAGE_KEY = 'torii_mock_attestations'

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomHex(len) {
  return '0x' + Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

function randomId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function decideVerdict(payload) {
  const amount = Number(payload.amount_minor_units)
  const blocked = ['KP', 'IR', 'SY', 'CU']
  if (blocked.includes(payload.origin_jurisdiction) || blocked.includes(payload.destination_jurisdiction))
    return 'Block'
  if (amount > 5_000_000) return 'Block'
  if (amount > 1_000_000) return 'Hold'
  return 'Pass'
}

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveAll(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function submitSettlement(payload) {
  await delay(900)

  const verdict = decideVerdict(payload)
  const record = {
    id: randomId(),
    wallet: payload.origin_wallet.toLowerCase(),
    destination_wallet: payload.destination_wallet.toLowerCase(),
    verdict,
    settlement_permitted: verdict === 'Pass',
    ceiling_blocked: false,
    elevated_by_prior_flag: false,
    attestation_id: randomId(),
    attestation_chain_tx_hash: randomHex(64),
    violation_count: verdict === 'Block' ? 1 : 0,
    has_risk_assessment: verdict !== 'Pass',
    minted_at: new Date().toISOString(),
    asset: payload.asset,
    amount_minor_units: Number(payload.amount_minor_units),
    origin_jurisdiction: payload.origin_jurisdiction,
    destination_jurisdiction: payload.destination_jurisdiction,
  }

  const all = loadAll()
  all.unshift(record)
  saveAll(all)

  return {
    verdict: record.verdict,
    settlement_permitted: record.settlement_permitted,
    ceiling_blocked: record.ceiling_blocked,
    elevated_by_prior_flag: record.elevated_by_prior_flag,
    attestation_id: record.attestation_id,
    attestation_chain_tx_hash: record.attestation_chain_tx_hash,
  }
}

export async function fetchWalletHistory(wallet) {
  await delay(600)

  const normalised = wallet.toLowerCase()
  const all = loadAll()
  const attestations = all.filter((r) => r.wallet === normalised)

  return {
    wallet: normalised,
    attestation_count: attestations.length,
    pass_count:  attestations.filter((a) => a.verdict === 'Pass').length,
    hold_count:  attestations.filter((a) => a.verdict === 'Hold').length,
    block_count: attestations.filter((a) => a.verdict === 'Block').length,
    attestations: attestations.map((a) => ({
      id:                  a.id,
      verdict:             a.verdict,
      violation_count:     a.violation_count,
      has_risk_assessment: a.has_risk_assessment,
      chain_tx_hash:       a.attestation_chain_tx_hash,
      minted_at:           a.minted_at,
    })),
  }
}