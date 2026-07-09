import { useState } from 'react'
import { fetchWalletHistory, ApiError } from '../api/client.js'
import VerdictBadge from '../components/VerdictBadge.jsx'

export default function WalletLookup() {
  const [wallet, setWallet] = useState('')
  const [status, setStatus] = useState('idle')
  const [history, setHistory] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  async function handleLookup(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage(null)
    setHistory(null)

    try {
      const response = await fetchWalletHistory(wallet)
      setHistory(response)
      setStatus('done')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unexpected error — check console'
      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Wallet Compliance History</h1>
      <p className="text-sm text-slate-400 mb-6 max-w-2xl">
        This is what a counterparty checks before transacting with a wallet
        — every settlement decision this wallet has ever produced, approved
        or not. History compounds the longer a wallet uses Torii; it cannot
        be edited, transferred, or backdated.
      </p>

      <form onSubmit={handleLookup} className="flex gap-3 mb-8">
        <input type="text" value={wallet} onChange={(e) => setWallet(e.target.value)}
          placeholder="0x1111111111111111111111111111111111111a" required
          className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm font-precision focus:outline-none focus:border-accent" />
        <button type="submit" disabled={status === 'loading'}
          className="bg-accent hover:bg-accent-muted disabled:opacity-50 transition-colors rounded px-5 py-2 text-sm font-medium whitespace-nowrap">
          {status === 'loading' ? 'Querying…' : 'Look Up History'}
        </button>
      </form>

      {errorMessage && (
        <div className="border border-verdict-block/40 bg-verdict-block/10 rounded px-4 py-3 text-sm text-red-200 mb-6">
          {errorMessage}
        </div>
      )}

      {status === 'idle' && (
        <div className="border border-dashed border-slate-800 rounded p-8 text-center text-sm text-slate-500">
          Enter a wallet address to view its attestation history.
        </div>
      )}

      {history && <HistoryView history={history} />}
    </div>
  )
}

function HistoryView({ history }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Attestations" value={history.attestation_count} />
        <StatCard label="Pass" value={history.pass_count} className="text-verdict-pass" />
        <StatCard label="Hold" value={history.hold_count} className="text-verdict-hold" />
        <StatCard label="Block" value={history.block_count} className="text-verdict-block" />
      </div>

      {history.attestation_count === 0 ? (
        <div className="border border-dashed border-slate-800 rounded p-8 text-center text-sm text-slate-500">
          No attestation history for this wallet yet. A clean history at
          zero is not the same as a verified-clean history — it means this
          wallet has never settled through Torii.
        </div>
      ) : (
        <div className="border border-slate-800 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-400 text-xs">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Minted</th>
                <th className="text-left px-4 py-2 font-medium">Verdict</th>
                <th className="text-left px-4 py-2 font-medium">Violations</th>
                <th className="text-left px-4 py-2 font-medium">Risk Assessed</th>
                <th className="text-left px-4 py-2 font-medium">Chain Tx</th>
              </tr>
            </thead>
            <tbody>
              {history.attestations.map((a) => (
                <tr key={a.id} className="border-t border-slate-800">
                  <td className="px-4 py-2 text-slate-300 font-precision text-xs">{new Date(a.minted_at).toLocaleString()}</td>
                  <td className="px-4 py-2"><VerdictBadge verdict={a.verdict} /></td>
                  <td className="px-4 py-2 text-slate-400">{a.violation_count}</td>
                  <td className="px-4 py-2 text-slate-400">{a.has_risk_assessment ? 'Yes' : 'Pending / none'}</td>
                  <td className="px-4 py-2 font-precision text-xs text-slate-500">
                    {a.chain_tx_hash ? truncateHash(a.chain_tx_hash) : 'pending…'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, className = 'text-slate-100' }) {
  return (
    <div className="border border-slate-800 rounded p-4 bg-slate-900/50">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-2xl font-semibold font-precision ${className}`}>{value}</div>
    </div>
  )
}

function truncateHash(hash) {
  if (hash.length <= 14) return hash
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}