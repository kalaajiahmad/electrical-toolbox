import React from 'react'

const Field = ({ label, children }) => (
  <div className="mb-2">
    <div className="text-xs font-semibold text-neutral-500 mb-1">{label}</div>
    {children}
  </div>
)

export default function CustomComponentModal({ onClose, onSave }){
  const [name, setName] = React.useState('Custom')
  const [shape, setShape] = React.useState('rect')
  const [w, setW] = React.useState(140)
  const [h, setH] = React.useState(90)
  const [ports, setPorts] = React.useState([{ id:'P1', dir:'both', side:'right' }])
  const [props, setProps] = React.useState([{ k:'model', v:'' }])

  const addPort = () => setPorts(p=> [...p, { id:`P${p.length+1}`, dir:'both', side:'right' }])
  const remPort = (i) => setPorts(p=> p.filter((_,idx)=> idx!==i))

  const addProp = () => setProps(p=> [...p, { k:'key'+(p.length+1), v:'' }])
  const remProp = (i) => setProps(p=> p.filter((_,idx)=> idx!==i))

  const save = () => {
    const cleanProps = Object.fromEntries(props.filter(x=>x.k).map(x=>[x.k, x.v]))
    onSave({
      name,
      template: { w, h, shape, ports: ports.map(p=> ({ ...p })), defaultProps: cleanProps }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden" onClick={(e)=>e.stopPropagation()}>
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <div className="font-semibold">New Component</div>
          <div className="flex-1" />
          <button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={onClose}>Close</button>
          <button className="rounded-lg border px-3 py-1 bg-neutral-900 text-white" onClick={save}>Save</button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4 overflow-auto">
          <div>
            <Field label="Name"><input className="w-full border rounded px-2 py-1" value={name} onChange={(e)=>setName(e.target.value)} /></Field>
            <Field label="Shape">
              <select className="w-full border rounded px-2 py-1" value={shape} onChange={(e)=>setShape(e.target.value)}>
                {['rect','circle'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Size">
              <div className="flex gap-2">
                <label className="text-xs text-neutral-500">W</label>
                <input type="number" className="w-24 border rounded px-2 py-1" value={w} onChange={(e)=>setW(parseFloat(e.target.value||0))} />
                <label className="text-xs text-neutral-500">H</label>
                <input type="number" className="w-24 border rounded px-2 py-1" value={h} onChange={(e)=>setH(parseFloat(e.target.value||0))} />
              </div>
            </Field>
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-500 mb-1">Ports</div>
            {ports.map((p,i)=>(
              <div key={i} className="flex items-center gap-2 mb-1">
                <input value={p.id} onChange={(e)=>setPorts(ps=> ps.map((pp,idx)=> idx===i? { ...pp, id:e.target.value }: pp ))} className="border rounded px-2 py-1 w-24" />
                <select value={p.side} onChange={(e)=>setPorts(ps=> ps.map((pp,idx)=> idx===i? { ...pp, side:e.target.value }: pp ))} className="border rounded px-2 py-1">{['left','right','top','bottom'].map(s=> <option key={s} value={s}>{s}</option>)}</select>
                <select value={p.dir} onChange={(e)=>setPorts(ps=> ps.map((pp,idx)=> idx===i? { ...pp, dir:e.target.value }: pp ))} className="border rounded px-2 py-1">{['in','out','both'].map(d=> <option key={d} value={d}>{d}</option>)}</select>
                <button className="ml-auto text-xs text-red-600 hover:underline" onClick={()=>remPort(i)}>Delete</button>
              </div>
            ))}
            <button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={addPort}>+ Add Port</button>
            <div className="h-3" />
            <div className="text-xs font-semibold text-neutral-500 mb-1">Default Properties</div>
            {props.map((kv,i)=>(
              <div key={i} className="flex items-center gap-2 mb-1">
                <input value={kv.k} onChange={(e)=>setProps(ps=> ps.map((pp,idx)=> idx===i? { ...pp, k:e.target.value }: pp ))} className="border rounded px-2 py-1 w-28" placeholder="key" />
                <input value={kv.v} onChange={(e)=>setProps(ps=> ps.map((pp,idx)=> idx===i? { ...pp, v:e.target.value }: pp ))} className="border rounded px-2 py-1 flex-1" placeholder="value" />
                <button className="ml-auto text-xs text-red-600 hover:underline" onClick={()=>remProp(i)}>Delete</button>
              </div>
            ))}
            <button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={addProp}>+ Add Property</button>
          </div>
        </div>
      </div>
    </div>
  )
}
