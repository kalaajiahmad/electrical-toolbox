import React from 'react'
const ToolToggle = ({ label, active, onClick }) => (<button onClick={onClick} className={`px-3 py-1 rounded-lg border ${active ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'}`}>{label}</button>)
export default function TopBar({ tool, setTool, zoom, setZoom, snap, setSnap, onShowNetlist, onShowBOM, onExportJSON, onImportJSON, onExportSVG, onExportPDF, simOn, setSimOn }){
  return (<div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
    <div className="mx-auto max-w-[1400px] px-3 sm:px-6 py-2 flex flex-wrap items-center gap-2">
      <div className="text-lg font-semibold tracking-tight">Cabinet Diagrammer Pro</div>
      <div className="flex items-center gap-1 ml-2">
        <ToolToggle label="Select" active={tool==='select'} onClick={()=>setTool('select')} />
        <ToolToggle label="Connect" active={tool==='connect'} onClick={()=>setTool('connect')} />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2 text-sm">
        <label className="flex items-center gap-1">Zoom
          <input type="range" min={0.4} max={2.5} step={0.05} value={zoom} onChange={(e)=>setZoom(parseFloat(e.target.value))} />
        </label>
        <label className="flex items-center gap-1">Snap
          <input type="number" className="w-16 border rounded px-2 py-1" min={1} max={100} value={snap} onChange={(e)=>setSnap(parseInt(e.target.value||'10'))} /> px
        </label>
        <button className={`rounded-lg border px-3 py-1 ${simOn?'bg-green-600 text-white':'hover:bg-neutral-100'}`} onClick={()=>setSimOn(!simOn)}>Simulate</button>
        <button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={onShowNetlist}>Wiring List</button>
        <button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={onShowBOM}>BOM</button>
        <button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={onExportJSON}>Export JSON</button>
        <label className="rounded-lg border px-3 py-1 hover:bg-neutral-100 cursor-pointer">Import JSON
          <input type="file" accept=".json" className="hidden" onChange={(e)=> e.target.files && onImportJSON(e.target.files[0])} />
        </label>
        <button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={onExportSVG} title="Ctrl/Cmd+E">Export SVG</button>
        <button className="rounded-lg border px-3 py-1 hover:bg-neutral-100" onClick={onExportPDF} title="Ctrl/Cmd+P">Export PDF</button>
      </div>
    </div></div>)
}
