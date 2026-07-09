import { Routes, Route, NavLink } from 'react-router-dom'
import SettlementConsole from './pages/SettlementConsole.jsx'
import WalletLookup from './pages/WalletLookup.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight">Torii</span>
          <span className="text-xs text-slate-400 border border-slate-700 rounded px-2 py-0.5">
            HashKey Chain — Compliance Gate
          </span>
        </div>
        <nav className="flex gap-1 text-sm">
          <NavTab to="/">Submit Settlement</NavTab>
          <NavTab to="/wallet-lookup">Wallet History</NavTab>
        </nav>
      </header>

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<SettlementConsole />} />
          <Route path="/wallet-lookup" element={<WalletLookup />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-800 px-6 py-3 text-xs text-slate-500">
        Torii Protocol — deterministic rules engine gates settlement; AI risk
        scoring is advisory and never blocks a transaction it evaluates.
      </footer>
    </div>
  )
}

function NavTab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1.5 rounded transition-colors ${
          isActive ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
        }`
      }
    >
      {children}
    </NavLink>
  )
}