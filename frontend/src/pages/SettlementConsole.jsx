import { useState } from 'react'
import { submitSettlement, ApiError } from '../api/client.js'
import VerdictBadge from '../components/VerdictBadge.jsx'

const ASSETS = ['UsdtHashKey', 'UsdcHashKey', 'HskNative']

const initialForm = {
  institution_id: '00000000-0000-0000-0000-000000000001',
  origin_wallet: '',
  destination_wallet: '',
  amount_minor_units: '',
  asset: 'UsdtHashKey',
  origin_jurisdiction: '',
  destination_jurisdiction: '',
}

export default function SettlementConsole() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage(null)
    setResult(null)

    try {
      const payload = { ...form, amount_minor_units: Number(form.amount_minor_units) }
      const response = await submitSettlement(payload)
      setResult(response)
      setStatus('done')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unexpected error — check console'
      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section>
        <h1 className="text-xl font-semibold mb-1">Submit Settlement</h1>
        <p className="text-sm text-slate-400 mb-6">
          Runs the full gate pipeline: deterministic rules → institutional
          ceiling → attestation mint → HashKey Chain anchor.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldPair label="Origin Wallet" value={form.origin_wallet}
            onChange={(v) => updateField('origin_wallet', v)}
            placeholder="0x1111111111111111111111111111111111111a" mono />
          <FieldPair label="Destination Wallet" value={form.destination_wallet}
            onChange={(v) => updateField('destination_wallet', v)}
            placeholder="0x2222222222222222222222222222222222222b" mono />

          <div className="grid grid-cols-2 gap-4">
            <FieldPair label="Amount (minor units)" value={form.amount_minor_units}
              onChange={(v) => updateField('amount_minor_units', v)}
              placeholder="100000" type="number" mono />
            <div>
              <label className="text-xs text-slate-400 block mb-1">Asset</label>
              <select value={form.asset} onChange={(e) => updateField('asset', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm font-precision">
                {ASSETS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldPair label="Origin Jurisdiction" value={form.origin_jurisdiction}
              onChange={(v) => updateField('origin_jurisdiction', v.toUpperCase())}
              placeholder="US" maxLength={2} mono />
            <FieldPair label="Destination Jurisdiction" value={form.destination_jurisdiction}
              onChange={(v) => updateField('destination_jurisdiction', v.toUpperCase())}
              placeholder="JP" maxLength={2} mono />
          </div>

          <button type="submit" disabled={status === 'submitting'}
            className="w-full bg-accent hover:bg-accent-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded py-2.5 text-sm font-medium">
            {status === 'submitting' ? 'Running gate pipeline…' : 'Submit Settlement'}
          </button>
        </form>

        {errorMessage && (
          <div className="mt-4 border border-verdict-block/40 bg-verdict-block/10 rounded px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">Gate Decision</h2>
        <p className="text-sm text-slate-400 mb-6">
          Every decision — including holds and blocks — mints an on-chain
          attestation. The audit trail is never survivor-biased toward
          approvals only.
        </p>

        {status === 'idle' && (
          <div className="border border-dashed border-slate-800 rounded p-8 text-center text-sm text-slate-500">
            Submit a settlement to see the gate decision here.
          </div>
        )}

        {result && <GateResult result={result} />}
      </section>
    </div>
  )
}

function GateResult({ result }) {
  return (
    <div className="border border-slate-800 rounded p-5 space-y-4 bg-slate-900/50">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Verdict</span>
        <VerdictBadge verdict={result.verdict} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Settlement Permitted</span>
        <span className={result.settlement_permitted ? 'text-verdict-pass' : 'text-verdict-block'}>
          {result.settlement_permitted ? 'Yes' : 'No'}
        </span>
      </div>

      {result.ceiling_blocked && (
        <div className="text-xs text-verdict-hold bg-verdict-hold/10 border border-verdict-hold/30 rounded px-3 py-2">
          Blocked by institutional ceiling — rules engine passed, but the
          settlement would exceed the configured rolling volume limit.
        </div>
      )}

      {result.elevated_by_prior_flag && (
        <div className="text-xs text-slate-300 bg-slate-800 rounded px-3 py-2">
          This wallet has an active review flag from a prior risk
          assessment — the amount-review threshold was tightened for this
          request as a result.
        </div>
      )}

      <div className="pt-2 border-t border-slate-800 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Attestation ID</span>
          <span className="font-precision text-slate-300">{result.attestation_id}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Chain Tx Hash</span>
          <span className="font-precision text-slate-300">{result.attestation_chain_tx_hash ?? 'pending…'}</span>
        </div>
      </div>
    </div>
  )
}

function FieldPair({ label, value, onChange, placeholder, type = 'text', mono, maxLength }) {
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} maxLength={maxLength} required
        className={`w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent ${mono ? 'font-precision' : ''}`} />
    </div>
  )
}