import React from 'react'
import { COMPONENT_LIBRARY } from '../lib/constants.js'

const Field = ({ label, children }) => (
  <div className="mb-2">
    <div className="text-xs font-semibold text-neutral-500 mb-1">{label}</div>
    {children}
  </div>
)

const NumberInput = ({ label, value, onChange }) => (
  <div className="flex items-center gap-1">
    <span className="text-xs text-neutral-500 w-5">{label}</span>
    <input type="number" className="w-20 border rounded px-2 py-1" value={value} onChange={(e)=>onChange(parseFloat(e.target.value||0))} />
  </div>
)

export default function PropertiesPanel({ nodes, setNodes, connections, setConnections, selected }){
  const selNode = selected.type==='node'? nodes.find(n=>n.id===selected.id):null
  const selConn = selected.type==='conn'? connections.find(c=>c.id===selected.id):null

  const updateNode = (patch) => { if (!selNode) return; setNodes(ns => ns.map(n => n.id===selNode.id ? { ...n, ...patch } : n)) }
  const updateNodeProps = (propsPatch) => { if (!selNode) return; setNodes(ns => ns.map(n => n.id===selNode.id ? { ...n, props: { ...(n.props||{}), ...propsPatch } } : n)) }
  const updateConn = (patch) => { if (!selConn) return; setConnections(cs => cs.map(c => c.id===selConn.id ? { ...c, ...patch } : c)) }

  return (
    <div className="shrink-0 border-l bg-white/60 backdrop-blur p-3 overflow-auto h-full">
      <div className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">Properties</div>
      {!selected.type && <div className="text-sm text-neutral-500">Select a node or connection.</div>}

      {selNode && (
        <div className="space-y-3">
          <Field label="Label">
            <input className="w-full border rounded px-2 py-1" value={selNode.label} onChange={(e)=>updateNode({ label:e.target.value })} />
          </Field>

          <Field label="Type">
            <select className="w-full border rounded px-2 py-1" value={selNode.type} onChange={(e)=>{ const type=e.target.value; const tpl=COMPONENT_LIBRARY[type]; updateNode({ type, w: tpl.w, h: tpl.h, ports: tpl.ports.map(p=>({...p})), props:{...(tpl.defaultProps||{})}, shape: tpl.shape||'rect' })}}>
              {Object.keys(COMPONENT_LIBRARY).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Dimensions">
            <div className="flex gap-2">
              <NumberInput label="W" value={selNode.w} onChange={(v)=>updateNode({ w:v })} />
              <NumberInput label="H" value={selNode.h} onChange={(v)=>updateNode({ h:v })} />
            </div>
          </Field>

          {selNode.type==='Breaker' && (
            <div className="flex items-center gap-2">
              <input id="brk" type="checkbox" checked={(selNode.props?.closed)!==false} onChange={(e)=>updateNodeProps({ closed: e.target.checked })} />
              <label htmlFor="brk" className="text-sm">Closed (On)</label>
            </div>
          )}

          {selNode.type==='LED' && (
            <div className="flex items-center gap-2">
              <label className="text-sm">LED Color</label>
              <select className="border rounded px-2 py-1" value={selNode.props?.ledColor || 'Green'} onChange={(e)=>updateNodeProps({ ledColor: e.target.value })}>
                {['Green','Red','Yellow','Blue','White'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-neutral-500">Properties</div>
            {Object.entries(selNode.props||{}).map(([k,v])=> (
              <Field key={k} label={k}>
                <input className="w-full border rounded px-2 py-1" value={v} onChange={(e)=>updateNodeProps({ [k]: e.target.value })} />
              </Field>
            ))}
          </div>

          <div>
            <div className="text-xs font-semibold text-neutral-500 mt-3">Ports</div>
            {selNode.ports.map((p,i)=> (
              <div key={p.id+String(i)} className="flex items-center gap-2 mb-1">
                <input value={p.id} onChange={(e)=>{ const id=e.target.value; const ports = selNode.ports.map((pp,idx)=> idx===i? { ...pp, id }: pp ); updateNode({ ports }); }} className="border rounded px-2 py-1 w-24" />
                <select value={p.side} onChange={(e)=>{ const side=e.target.value; const ports = selNode.ports.map((pp,idx)=> idx===i? { ...pp, side }: pp ); updateNode({ ports }); }} className="border rounded px-2 py-1">{['left','right','top','bottom'].map(s=> <option key={s} value={s}>{s}</option>)}</select>
                <select value={p.dir} onChange={(e)=>{ const dir=e.target.value; const ports = selNode.ports.map((pp,idx)=> idx===i? { ...pp, dir }: pp ); updateNode({ ports }); }} className="border rounded px-2 py-1">{['in','out','both'].map(d=> <option key={d} value={d}>{d}</option>)}</select>
                <button className="ml-auto text-xs text-red-600 hover:underline" onClick={()=>updateNode({ ports: selNode.ports.filter((_,idx)=> idx!==i) })}>Delete</button>
              </div>
            ))}
            <button className="w-full rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={()=>updateNode({ ports: [...selNode.ports, { id:`P${selNode.ports.length+1}`, dir:'both', side:'right' }] })}>+ Add Port</button>
          </div>
        </div>
      )}

      {selConn && (
        <div className="space-y-3">
          <Field label="Label">
            <input className="w-full border rounded px-2 py-1" value={selConn.label||''} onChange={(e)=>updateConn({ label: e.target.value })} />
          </Field>

          <Field label="Connection Type">
            <select className="w-full border rounded px-2 py-1" value={selConn.kind} onChange={(e)=>{ const kind=e.target.value; const phaseDefault = kind==='AC'?'L': (kind==='DC'?'+':'S'); updateConn({ kind, phase: phaseDefault }); }}>
              {['AC','DC','Signal'].map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>

          <Field label="Phase / Polarity">
            <select className="w-full border rounded px-2 py-1" value={selConn.phase} onChange={(e)=>updateConn({ phase: e.target.value })}>
              {selConn.kind==='AC' && ['L','N','PE'].map(p => <option key={p} value={p}>{p}</option>)}
              {selConn.kind==='DC' && ['+','-'].map(p => <option key={p} value={p}>{p}</option>)}
              {selConn.kind==='Signal' && ['S'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>

          <Field label="Wire Color">
            <input type="color" value={selConn.color || (selConn ? (selConn.kind==='DC' ? (selConn.phase==='+'?'#dc2626':'#111111') : (selConn.kind==='AC' ? (selConn.phase==='L'?'#8B4513':(selConn.phase==='N'?'#2563eb':'#16a34a')) : '#6b7280')) : '#6b7280')} onChange={(e)=>updateConn({ color: e.target.value })} />
            <div className="text-xs text-neutral-500">Empty = palette default.</div>
          </Field>

          <button className="w-full rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={()=> setConnections(cs=> cs.filter(c=>c.id!==selConn.id))}>Delete Connection</button>
        </div>
      )}
    </div>
  )
}
