import React from 'react'
import { download, ts } from '../../lib/utils.js'
import { buildBOM } from '../../lib/logic.js'
export default function BomModal({ onClose, nodes }){
  const rows = React.useMemo(()=> buildBOM(nodes), [nodes])
  const exportCSV = () => { const header = ['Type','Count','Sample Label','Key Props']; const csv = [header, ...rows.map(r => [r.type, r.count, r.labelSample, r.keyProps])].map(row => row.map(x => JSON.stringify(x ?? '')).join(',')).join('\n'); download(new Blob([csv], { type:'text/csv' }), `bom-${ts()}.csv`) }
  return (<div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e)=>e.stopPropagation()}>
      <div className="px-4 py-3 border-b flex items-center gap-2"><div className="font-semibold">Bill of Materials</div><div className="text-xs text-neutral-500">{rows.reduce((a,r)=>a+r.count,0)} items • {rows.length} lines</div><div className="flex-1" /><button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={exportCSV}>Export CSV</button><button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={onClose}>Close</button></div>
      <div className="p-4 overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left text-neutral-500"><th className="py-2 pr-3">Type</th><th className="py-2 pr-3">Count</th><th className="py-2 pr-3">Sample Label</th><th className="py-2 pr-3">Key Props</th></tr></thead><tbody>{rows.map((r,i)=> (<tr key={i} className="border-t"><td className="py-2 pr-3">{r.type}</td><td className="py-2 pr-3">{r.count}</td><td className="py-2 pr-3">{r.labelSample}</td><td className="py-2 pr-3">{r.keyProps}</td></tr>))}</tbody></table></div>
    </div></div>)
}
