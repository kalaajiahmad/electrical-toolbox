import React from 'react'
import { COMPONENT_LIBRARY } from '../lib/constants.js'
export default function Palette({ onAdd, onNewComponent }){
  const groups = React.useMemo(()=> ({
    Power: ['Power Supply','Breaker','Fuse','Contactor','Diode'],
    IO: ['Terminal','Meter','LED','Alarm','Temp Sensor','Regulator'],
    External: ['PV Array','Battery Bank','Load/House','Grid'],
  }), [])
  return (<div className="shrink-0 border-r bg-white/60 backdrop-blur p-3 flex flex-col gap-3 overflow-auto h-full">
    <div className="flex items-center justify-between"><div className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Components</div><button className="text-xs rounded-lg border px-2 py-1 hover:bg-neutral-100" onClick={onNewComponent}>New</button></div>
    {Object.entries(groups).map(([name, list]) => (<div key={name}>
      <div className="text-xs font-semibold text-neutral-500 mb-1">{name}</div>
      <div className="grid grid-cols-2 gap-2">
        {list.map((t) => (<button key={t} className="border rounded-xl p-2 text-left hover:shadow-sm hover:bg-neutral-50 active:scale-[0.99] transition" onClick={()=>onAdd(t)} title={`Add ${t}`}>
          <div className="text-[11px] font-semibold">{t}</div>
          <div className="text-[10px] text-neutral-500">{(COMPONENT_LIBRARY[t].ports||[]).length} ports</div>
        </button>))}
      </div>
    </div>))}
    <div className="text-xs text-neutral-500 mt-2">Tip: Use <span className="font-mono">Connect</span> then click Source port → Destination port → Confirm.</div>
  </div>)
}
