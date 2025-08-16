import React from 'react'
import TopBar from './components/TopBar.jsx'
import Palette from './components/Palette.jsx'
import Canvas from './components/Canvas.jsx'
import PropertiesPanel from './components/PropertiesPanel.jsx'
import NetlistModal from './components/modals/NetlistModal.jsx'
import BomModal from './components/modals/BomModal.jsx'
import CustomComponentModal from './components/modals/CustomComponentModal.jsx'

import { COMPONENT_LIBRARY, EXTERNALS } from './lib/constants.js'
import { clamp, download, ts } from './lib/utils.js'
import { getCanvasCenter } from './lib/geometry.js'
import { inferConnDefaults, findEnergized, phaseColor } from './lib/logic.js'

export default function App(){
  const [nodes, setNodes] = React.useState([])
  const [connections, setConnections] = React.useState([])
  const [tool, setTool] = React.useState('select')
  const [selected, setSelected] = React.useState({ type:null, id:null })
  const [zoom, setZoom] = React.useState(1)
  const [pan, setPan] = React.useState({ x:0, y:0 })
  const [snap, setSnap] = React.useState(10)
  const [showNetlist, setShowNetlist] = React.useState(false)
  const [showBOM, setShowBOM] = React.useState(false)
  const [showNewComponent, setShowNewComponent] = React.useState(false)
  const [userComponents, setUserComponents] = React.useState({})
  const [simOn, setSimOn] = React.useState(false)
  const [sim, setSim] = React.useState({ energizedPorts:new Set(), energizedConns:new Set() })
  const [pending, setPending] = React.useState(null) // {from,to?,kind,phase,color?,label}

  const svgRef = React.useRef(null)
  const canvasRef = React.useRef(null)

  const LIB = React.useMemo(()=> ({ ...COMPONENT_LIBRARY, ...userComponents }), [userComponents])

  // persistence
  React.useEffect(()=>{ localStorage.setItem('ecad_pro_project', JSON.stringify({ nodes, connections })) }, [nodes, connections])
  React.useEffect(()=>{ const raw = localStorage.getItem('ecad_pro_project'); if (raw){ try { const { nodes:n, connections:c } = JSON.parse(raw); if (Array.isArray(n)&&Array.isArray(c)) { setNodes(n); setConnections(c) } } catch {} } }, [])

  const addNode = (type) => {
    const tpl = LIB[type]
    const id = Math.random().toString(36).slice(2,10)
    const center = getCanvasCenter(canvasRef.current, zoom, pan)
    const node = { id, type, label: `${type} ${id.slice(-4)}`, x: center.x - tpl.w/2, y: center.y - tpl.h/2, w: tpl.w, h: tpl.h, props: { ...(tpl.defaultProps||{}) }, ports: tpl.ports.map(p=>({ ...p })), color: Object.prototype.hasOwnProperty.call(EXTERNALS, type)? '#0ea5e9':'#111827', shape: tpl.shape||'rect' }
    setNodes(s=>[...s, node]); setSelected({ type:'node', id })
  }

  // keybinds
  React.useEffect(()=>{
    const onKey = (e)=>{
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='e'){ e.preventDefault(); exportSVG() }
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='p'){ e.preventDefault(); exportPDF() }
      if (e.key==='Delete' || e.key==='Backspace'){ if (selected.type==='node'){ const id=selected.id; setConnections(cs=>cs.filter(c=>c.from.nodeId!==id && c.to.nodeId!==id)); setNodes(ns=>ns.filter(n=>n.id!==id)); setSelected({type:null,id:null}) } if (selected.type==='conn'){ setConnections(cs=>cs.filter(c=>c.id!==selected.id)); setSelected({type:null,id:null}) } }
    }
    window.addEventListener('keydown', onKey); return ()=>window.removeEventListener('keydown', onKey)
  }, [selected])

  // exports
  const exportJSON = () => download(new Blob([JSON.stringify({ nodes, connections }, null, 2)], { type:'application/json' }), `ecad-${ts()}.json`)
  const importJSON = (file) => { const reader = new FileReader(); reader.onload = () => { try { const {nodes:n, connections:c} = JSON.parse(reader.result); if (Array.isArray(n)&&Array.isArray(c)) { setNodes(n); setConnections(c) } } catch { alert('Invalid JSON') } }; reader.readAsText(file) }
  const exportSVG = () => { const svg = svgRef.current; if (!svg) return; const clone = svg.cloneNode(true); const bg = document.createElementNS('http://www.w3.org/2000/svg','rect'); bg.setAttribute('x','-5000'); bg.setAttribute('y','-5000'); bg.setAttribute('width','10000'); bg.setAttribute('height','10000'); bg.setAttribute('fill','white'); clone.insertBefore(bg, clone.firstChild); download(new Blob([new XMLSerializer().serializeToString(clone)], { type:'image/svg+xml;charset=utf-8' }), `diagram-${ts()}.svg`) }
  const exportPDF = () => { const svg = svgRef.current; if (!svg) return; const svgString = new XMLSerializer().serializeToString(svg); const html = `<!doctype html><html><head><meta charset='utf-8'><title>Diagram PDF</title><style>@page{size:A4 landscape;margin:12mm;}body{margin:0}.wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center}svg{max-width:95%;max-height:95%}</style></head><body><div class='wrap'>${svgString}</div><script>setTimeout(()=>window.print(),200)</script></body></html>`; const blob = new Blob([html], { type:'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `diagram-${ts()}.html`; a.click(); URL.revokeObjectURL(url) }


  // Enter to confirm pending wire in connect mode
  React.useEffect(()=>{
    const onKey=(e)=>{ if (tool==='connect' && pending && pending.to && e.key==='Enter'){ e.preventDefault(); (confirmConnection()); } }
    window.addEventListener('keydown', onKey); return ()=>window.removeEventListener('keydown', onKey)
  }, [tool, pending])

  // manual wiring
  const beginFrom = (nodeId, portId) => { const d = inferConnDefaults(portId, null); setPending({ from:{nodeId,portId}, kind:d.kind, phase:d.phase, color:'', label:'' }) }
  const chooseTo = (nodeId, portId) => setPending(p => { if (!p) return p; const d = inferConnDefaults(p.from.portId, portId); return { ...p, kind: d.kind, phase: d.phase, to:{ nodeId, portId } } })
  const confirmConnection = () => { if (!pending || !pending.to) return; const id = Math.random().toString(36).slice(2,10); const color = pending.color && pending.color!=='' ? pending.color : undefined; const conn = { id, from: pending.from, to: pending.to, kind: pending.kind, phase: pending.phase, label: pending.label||'', color }; setConnections(cs => [...cs, conn]); setSelected({ type:'conn', id }); setPending(null) }

  // pan
  const panState = React.useRef({ dragging:false, last:null })
  const onCanvasPointerDown = (e) => { if (e.button !== 0) return; if (e.target.closest('[data-node]') || e.target.closest('[data-port]')) return; panState.current.dragging = true; panState.current.last = { x:e.clientX, y:e.clientY } }
  const onCanvasPointerMove = (e) => { if (!panState.current.dragging) return; const dx = e.clientX - panState.current.last.x; const dy = e.clientY - panState.current.last.y; panState.current.last = { x:e.clientX, y:e.clientY }; setPan(p => ({ x: p.x + dx, y: p.y + dy })) }
  const onCanvasPointerUp = () => (panState.current.dragging = false)

  // layout panes
  const [leftWidth, setLeftWidth] = React.useState(260)
  const [rightWidth, setRightWidth] = React.useState(320)
  const leftDrag = React.useRef({ active:false, x:0, start:260 })
  const rightDrag = React.useRef({ active:false, x:0, start:320 })
  const onLeftHandleDown = (e) => { leftDrag.current = { active:true, x:e.clientX, start:leftWidth } }
  const onRightHandleDown = (e) => { rightDrag.current = { active:true, x:e.clientX, start:rightWidth } }
  React.useEffect(()=>{
    const move = (e) => {
      if (leftDrag.current.active){ const dx = e.clientX - leftDrag.current.x; setLeftWidth(w => Math.max(160, Math.min(480, leftDrag.current.start + dx))) }
      if (rightDrag.current.active){ const dx = rightDrag.current.x - e.clientX; setRightWidth(w => Math.max(200, Math.min(520, rightDrag.current.start + dx))) }
    }
    const up = () => { leftDrag.current.active=false; rightDrag.current.active=false }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [])

  // simulation recompute
  React.useEffect(()=>{ if (!simOn){ setSim({ energizedPorts:new Set(), energizedConns:new Set() }); return } const res = findEnergized(nodes, connections); setSim(res) }, [simOn, nodes, connections])

  const inferredColor = React.useMemo(()=> pending ? phaseColor(pending) : '#6b7280', [pending])

  return (
    <div className="w-full h-full min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      <TopBar tool={tool} setTool={setTool} zoom={zoom} setZoom={setZoom} snap={snap} setSnap={setSnap}
        onShowNetlist={()=>setShowNetlist(true)} onShowBOM={()=>setShowBOM(true)}
        onExportJSON={exportJSON} onImportJSON={importJSON} onExportSVG={exportSVG} onExportPDF={exportPDF}
        simOn={simOn} setSimOn={setSimOn} />

      <div className="flex-1 flex overflow-hidden">
        <div style={{ width: leftWidth }} className="shrink-0 h-full border-r bg-white/60 backdrop-blur overflow-auto">
          <Palette onAdd={addNode} onNewComponent={()=>setShowNewComponent(true)} />
        </div>
        <div onMouseDown={onLeftHandleDown} className="w-1.5 cursor-col-resize bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400" title="Drag to resize" />

        <div className="relative flex-1">
          <div
            ref={canvasRef}
            className="absolute inset-0"
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            onWheel={(e)=>{ const factor = e.deltaY>0 ? 0.9 : 1.1; setZoom(z => clamp(z*factor, 0.4, 2.5)); }}
          >
            <Canvas
              svgRef={svgRef}
              nodes={nodes}
              setNodes={setNodes}
              connections={connections}
              setConnections={setConnections}
              zoom={zoom}
              pan={pan}
              snap={snap}
              tool={tool}
              selected={selected}
              setSelected={setSelected}
              onBeginFrom={beginFrom}
              onChooseTo={chooseTo}
              pending={pending}
              sim={sim}
            />
          </div>

          {pending && (
            <div className="absolute left-3 bottom-3 bg-white border rounded-2xl shadow p-3 flex flex-col gap-2 w-[340px]">
              <div className="text-sm font-semibold">New Connection</div>
              <div className="text-xs text-neutral-500">Defaults inferred from port IDs. Override below.</div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-neutral-500">Type</label>
                  <select className="w-full border rounded px-2 py-1" value={pending.kind} onChange={(e)=>setPending({...pending, kind:e.target.value, phase: e.target.value==='AC'?'L': (e.target.value==='DC'?'+':'S') })}>
                    {['AC','DC','Signal'].map(k=> <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Phase</label>
                  <select className="w-28 border rounded px-2 py-1" value={pending.phase} onChange={(e)=>setPending({...pending, phase:e.target.value})}>
                    {pending.kind==='AC' && ['L','N','PE'].map(p => <option key={p} value={p}>{p}</option>)}
                    {pending.kind==='DC' && ['+','-'].map(p => <option key={p} value={p}>{p}</option>)}
                    {pending.kind==='Signal' && ['S'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-500">Color</label>
                <input type="color" value={pending.color || inferredColor} onChange={(e)=>setPending({...pending, color:e.target.value})} />
                <button className="text-xs underline" onClick={()=>setPending({...pending, color:''})}>Clear</button>
                <div className="text-xs text-neutral-500">Empty = default</div>
              </div>
              <div>
                <label className="text-xs text-neutral-500">Label</label>
                <input className="w-full border rounded px-2 py-1" value={pending.label||''} onChange={(e)=>setPending({...pending, label:e.target.value})} />
              </div>
              <div className="flex gap-2 justify-end">
                <button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={()=>setPending(null)}>Cancel</button>
                <button className="rounded-lg border px-3 py-1 bg-neutral-900 text-white" disabled={!pending.to} onClick={confirmConnection}>Confirm</button>
              </div>
            </div>
          )}
        </div>

        <div onMouseDown={onRightHandleDown} className="w-1.5 cursor-col-resize bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400" title="Drag to resize" />
        <div style={{ width: rightWidth }} className="shrink-0 h-full border-l bg-white/60 backdrop-blur overflow-auto">
          <PropertiesPanel nodes={nodes} setNodes={setNodes} connections={connections} setConnections={setConnections} selected={selected} />
        </div>
      </div>

      {showNetlist && (<NetlistModal onClose={()=>setShowNetlist(false)} nodes={nodes} connections={connections} />)}
      {showBOM && (<BomModal onClose={()=>setShowBOM(false)} nodes={nodes} />)}
      {showNewComponent && (<CustomComponentModal onClose={()=>setShowNewComponent(false)} onSave={({name, template})=>{ setUserComponents(prev=> ({ ...prev, [name]: template })); setShowNewComponent(false); }} />)}
    </div>
  )
}
