const STYLES = {
  Pass: 'bg-verdict-pass/15 text-verdict-pass border-verdict-pass/30',
  Hold: 'bg-verdict-hold/15 text-verdict-hold border-verdict-hold/30',
  Block: 'bg-verdict-block/15 text-verdict-block border-verdict-block/30',
}

export default function VerdictBadge({ verdict }) {
  const style = STYLES[verdict] ?? 'bg-slate-800 text-slate-300 border-slate-700'
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded border ${style}`}>
      {verdict}
    </span>
  )
}