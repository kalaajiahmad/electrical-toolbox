import React from 'react'
import NodeShape from './NodeShape.jsx'
import { calcAllPortPositions, clientToCanvasPoint, makePath, portPositionForNode } from '../lib/geometry.js'
import { EXTERNALS } from '../lib/constants.js'
import { isExternal } from '../lib/utils.js'
import { phaseColor, flowDirection } from '../lib/logic.js'

export default function Canvas({ svgRef, nodes, setNodes, connections, setConnections, zoom, pan, snap, tool, selected, setSelected, onBeginFrom, onChooseTo, pending, sim }){
  const [drag, setDrag] = React.useState(null)

  const onNodePointerDown = (e, id) => {
    if (e.button!==0) return
    const node = nodes.find(n=>n.id===id)
    const start = clientToCanvasPoint(e.clientX, e.clientY, zoom, pan)
    setDrag({ id, dx: start.x - node.x, dy: start.y - node.y })
    setSelected({ type: 'node', id })
  }
  const onNodePointerMove = (e) => {
    if (!drag) return
    const pt = clientToCanvasPoint(e.clientX, e.clientY, zoom, pan)
    const nx = Math.round((pt.x - drag.dx)/snap)*snap
    const ny = Math.round((pt.y - drag.dy)/snap)*snap
    setNodes(ns => ns.map(n => n.id===drag.id ? { ...n, x:nx, y:ny } : n))
  }
  const onNodePointerUp = ()=> setDrag(null)

  const setNodeProps = (id, props) => setNodes(ns => ns.map(n => n.id===id ? { ...n, props: { ...(n.props||{}), ...props } } : n))

  const portPos = React.useMemo(()=> calcAllPortPositions(nodes), [nodes])
  const connPaths = React.useMemo(()=> connections.map(c=>{
    const a = portPos.get(`${c.from.nodeId}:${c.from.portId}`)
    const b = portPos.get(`${c.to.nodeId}:${c.to.portId}`)
    if (!a || !b) return { id:c.id, d:'', color:'#999' }
    return { id:c.id, d: makePath(a,b), color: c.color || phaseColor(c) }
  }), [connections, portPos])

  const rubber = React.useMemo(()=> {
    if (!pending || !pending.from || !pending.to) return null
    const a = portPos.get(`${pending.from.nodeId}:${pending.from.portId}`)
    const b = portPos.get(`${pending.to.nodeId}:${pending.to.portId}`)
    if (!a || !b) return null
    return makePath(a,b)
  }, [pending, portPos])

  const connMap = React.useMemo(()=> Object.fromEntries(connections.map(c=>[c.id, c])), [connections])

  return (
    <svg ref={svgRef} className="w-full h-full touch-none" onPointerMove={onNodePointerMove} onPointerUp={onNodePointerUp}>
      <defs>
        <filter id="selglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
        <pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="white" />
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
          <path d="M 8 0 L 8 40 M 16 0 L 16 40 M 24 0 L 24 40 M 32 0 L 32 40" stroke="#f3f4f6" strokeWidth="1" />
          <path d="M 0 8 L 40 8 M 0 16 L 40 16 M 0 24 L 40 24 M 0 32 L 40 32" stroke="#f3f4f6" strokeWidth="1" />
        </pattern>
        <marker id="dot" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="3" fill="#111827" /></marker>
      </defs>

      <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
        <rect x={-5000} y={-5000} width={10000} height={10000} fill="url(#grid)" />

        <g>
          {connPaths.map(p => {
            const energized = sim?.energizedConns?.has(p.id)
            const c = connMap[p.id]
            const dir = c?.kind==='DC' ? flowDirection(c) : 0
            return (
              <path key={p.id} d={p.d} stroke={p.color} strokeWidth={energized?4:3} fill="none" markerStart="url(#dot)" markerEnd="url(#dot)"
                opacity={selected.type==='conn'&&selected.id===p.id?1: (energized?1:0.95)}
                className={energized && c?.kind==='DC' ? (dir===-1 ? 'flow-wire rev' : 'flow-wire') : undefined}
                filter={selected.type==='conn'&&selected.id===p.id? 'url(#selglow)' : undefined} onPointerDown={(e)=>{ e.stopPropagation(); setSelected({ type:'conn', id: p.id }); }}
              />
            )
          })}
          {rubber && <path d={rubber} stroke={pending?.color || (pending ? phaseColor(pending) : '#6b7280')} strokeWidth={3} fill="none" strokeDasharray="6 4" />}
        </g>

        <g>
          {nodes.map(n => (
            <g key={n.id} data-node transform={`translate(${n.x}, ${n.y})`} className={`cursor-grab ${selected.type==='node'&&selected.id===n.id? 'drop-shadow-[0_0_0_3px_rgba(59,130,246,0.5)]':''}`} onPointerDown={(e)=>onNodePointerDown(e,n.id)}>
              <NodeShape node={{...n, lit: (n.type==='LED' ? (sim?.energizedPorts?.has(`${n.id}:+`) && sim?.energizedPorts?.has(`${n.id}:-`)) : false) }} />
              {/* Breaker inline toggle */}
              {n.type==='Breaker' && (
                <foreignObject x={n.w-58} y={6} width={52} height={24}>
                  <button className={`w-full h-6 text-[10px] rounded-md border ${ (n.props?.closed)!==false ? 'bg-green-600 text-white' : 'bg-neutral-100' }`} title="Toggle Breaker" onClick={(e)=>{ e.stopPropagation(); setNodeProps(n.id, { closed: ((n.props?.closed)!==false) ? false : true }); }}>
                    {(n.props?.closed)!==false ? 'ON' : 'OFF'}
                  </button>
                </foreignObject>
              )}
              <foreignObject x={0} y={-24} width={n.w} height={24}>
                <div className="w-full h-6 text-[11px] font-semibold text-center select-none">{n.label}</div>
              </foreignObject>
              {n.ports.map((p, idx) => {
                const pp = portPositionForNode(n,p,idx)
                return (
                  <g key={p.id} transform={`translate(${pp.x}, ${pp.y})`} data-port>
                    <circle r={6} fill={isExternal(n.type, EXTERNALS)?'#0ea5e9':'#111827'} stroke={ (pending && ((pending.from && pending.from.nodeId===n.id && pending.from.portId===p.id) || (pending.to && pending.to.nodeId===n.id && pending.to.portId===p.id))) ? '#f59e0b' : '#fff' } strokeWidth={ (pending && ((pending.from && pending.from.nodeId===n.id && pending.from.portId===p.id) || (pending.to && pending.to.nodeId===n.id && pending.to.portId===p.id))) ? 3 : 1 }
                      onPointerDown={(e)=>{ e.stopPropagation(); setSelected({ type:'port', id:`${n.id}:${p.id}` }); }}
                      onClick={(e)=>{ e.stopPropagation(); if (tool==='connect') { !pending ? onBeginFrom(n.id,p.id) : (!pending.to && onChooseTo(n.id,p.id)) } }}
                    />
                    <text x={p.side==='left'?-8:8} y={4} fontSize={10} textAnchor={p.side==='left'?'end':'start'} fill="#374151">{p.id}</text>
                  </g>
                )
              })}
            </g>
          ))}
        </g>
      </g>
    </svg>
  )
}
