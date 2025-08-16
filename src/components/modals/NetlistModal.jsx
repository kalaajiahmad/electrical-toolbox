import React from 'react'
import { download, ts } from '../../lib/utils.js'
export default function NetlistModal({ onClose, nodes, connections }){
  const map = React.useMemo(()=> Object.fromEntries(nodes.map(n=>[n.id,n])), [nodes])
  const entries = React.useMemo(()=> connections.map(c => ({
    id: c.id, type: c.kind, phase: c.phase, label: c.label || '',
    from: `${map[c.from.nodeId]?.label || c.from.nodeId}.${c.from.portId}`,
    to: `${map[c.to.nodeId]?.label || c.to.nodeId}.${c.to.portId}`, color: c.color || '',
  })), [nodes, connections])
  const exportCSV = () => { const header = ['ID','Type','Phase','Label','From','To','Color']; const csv = [header, ...entries.map(e => [e.id,e.type,e.phase,e.label,e.from,e.to,e.color])].map(r => r.map(x => JSON.stringify(x ?? '')).join(',')).join('\n'); download(new Blob([csv], { type:'text/csv' }), `wiring-${ts()}.csv`) }
  return (<div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden" onClick={(e)=>e.stopPropagation()}>
      <div className="px-4 py-3 border-b flex items-center gap-2"><div className="font-semibold">Wiring List</div><div className="text-xs text-neutral-500">{entries.length} connections</div><div className="flex-1" /><button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={exportCSV}>Export CSV</button><button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={onClose}>Close</button></div>
      <div className="p-4 overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left text-neutral-500"><th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Type</th><th className="py-2 pr-3">Phase</th><th className="py-2 pr-3">Label</th><th className="py-2 pr-3">From</th><th className="py-2 pr-3">To</th><th className="py-2 pr-3">Color</th></tr></thead><tbody>{entries.map(e => (<tr key={e.id} className="border-t"><td className="py-2 pr-3 font-mono text-[11px]">{e.id}</td><td className="py-2 pr-3">{e.type}</td><td className="py-2 pr-3">{e.phase}</td><td className="py-2 pr-3">{e.label}</td><td className="py-2 pr-3">{e.from}</td><td className="py-2 pr-3">{e.to}</td><td className="py-2 pr-3">{e.color}</td></tr>))}</tbody></table></div>
    </div></div>)
}
