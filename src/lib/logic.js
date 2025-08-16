import { CONNECTION_TYPES, EXTERNALS, KEY_PROPS_ORDER } from './constants.js'

export const phaseColor = (c) => {
  const t = CONNECTION_TYPES.find(k=>k.key===c.kind)
  return (t?.palette?.[c.phase]) || '#6b7280'
}

export const buildBOM = (nodes) => {
  const lines = {}
  for (const n of nodes){
    const props = n.props||{}
    const keys = KEY_PROPS_ORDER.filter(k => props[k]).map(k => `${k}:${props[k]}`).join(';')
    const key = `${n.type}|${keys}`
    if (!lines[key]) lines[key] = { type:n.type, count:0, labelSample:n.label, keyProps: keys }
    lines[key].count += 1
  }
  return Object.values(lines).sort((a,b)=> a.type.localeCompare(b.type))
}

export const groupsForPalette = () => ({
  Power: ['Power Supply','Breaker','Fuse','Contactor','Diode'],
  IO: ['Terminal','Meter','LED','Alarm','Temp Sensor','Regulator'],
  External: Object.keys(EXTERNALS),
})

// Defaults from port IDs
export function inferConnDefaults(fromPortId, toPortId) {
  const pids = [fromPortId, toPortId].filter(Boolean).map(s => (s||'').toUpperCase())
  const has = (v) => pids.some(id => id === v || id.includes(v))
  if (has('AC_L') || has(' L') || has('L_') || pids.includes('L')) return { kind:'AC', phase:'L' }
  if (has('AC_N') || has(' N') || has('N_') || pids.includes('N')) return { kind:'AC', phase:'N' }
  if (has('PE') || has('GND') || has('EARTH')) return { kind:'AC', phase:'PE' }
  if (has('+') || has('V+') || has('VIN+') || has('VOUT+') || pids.includes('+')) return { kind:'DC', phase:'+' }
  if (has('-') || has('V-') || has('VIN-') || has('VOUT-') || has('0V') || pids.includes('-')) return { kind:'DC', phase:'-' }
  return { kind:'Signal', phase:'S' }
}

// Flow direction for DC
export function flowDirection(c){
  const up = (s)=> (s||'').toUpperCase()
  const f = up(c.from.portId), t = up(c.to.portId)
  const isP = (x)=> x==='+' || x.includes('V+') || x.includes('VIN+') || x.includes('VOUT+') || x.includes('+24')
  const isM = (x)=> x==='-' || x.includes('V-') || x.includes('VIN-') || x.includes('VOUT-') || x==='0V'
  if (c.kind==='DC'){
    if (isP(f) && isM(t)) return 1
    if (isM(f) && isP(t)) return -1
    if (isP(f)) return 1
    if (isP(t)) return -1
  }
  return 0
}

// Simulation
// Simulation with directed DC flow
export function findEnergized(nodes, connections){
  const pk = (nid,pid)=>`${nid}:${pid}`

  const adj = new Map(), radj = new Map()
  const add = (a,b)=>{ if(!adj.has(a)) adj.set(a,new Set()); adj.get(a).add(b); if(!radj.has(b)) radj.set(b,new Set()); radj.get(b).add(a) }
  const addUndirected = (a,b)=>{ add(a,b); add(b,a) }

  const edges = []
  connections.forEach(c=>{
    const a = pk(c.from.nodeId, c.from.portId)
    const b = pk(c.to.nodeId, c.to.portId)
    addUndirected(a,b)
    edges.push([a,b,c.id,c.kind])
  })

  // Internals
  nodes.forEach(n=>{
    const N = (id)=> pk(n.id,id)
    const byId = Object.fromEntries(n.ports.map(p=>[p.id,p]))
    const t = (n.type||'').toLowerCase()
    if (t==='terminal' && byId['1'] && byId['2']) addUndirected(N('1'),N('2'))
    if (t==='fuse' && byId['IN'] && byId['OUT']) addUndirected(N('IN'),N('OUT'))
    if (t==='breaker'){
      const closed = (n.props && n.props.closed)!==false
      if (closed){
        if (byId['L_in'] && byId['L_out']) addUndirected(N('L_in'),N('L_out'))
        if (byId['N_in'] && byId['N_out']) addUndirected(N('N_in'),N('N_out'))
      }
    }
    if (t==='diode' && byId['A'] && byId['K']) add(N('A'), N('K'))
    if (t==='led' && byId['+'] && byId['-']) add(N('+'), N('-'))
    if (t==='regulator'){
      if (byId['VIN+'] && byId['VOUT+']) add(N('VIN+'), N('VOUT+'))
      if (byId['VIN-'] && byId['VOUT-']) add(N('VIN-'), N('VOUT-'))
    }
  })

  // Helper flood
  const flood = (seeds, useAdj)=>{
    const visited = new Set(seeds)
    const q = [...visited]
    while(q.length){
      const k = q.shift()
      const outs = (useAdj.get(k) || new Set())
      for (const nb of outs){ if(!visited.has(nb)){ visited.add(nb); q.push(nb) } }
    }
    return visited
  }

  // AC pre-pass (which AC ports are energized)
  const acSeeds = new Set()
  nodes.forEach(n=>{
    const t = (n.type||'').toLowerCase()
    n.ports.forEach(p=>{
      const id = (p.id||'').toUpperCase()
      if (t.includes('grid')){ if (id==='L' || id==='AC_L' || id==='N' || id==='AC_N') acSeeds.add(pk(n.id,p.id)) }
    })
  })
  const P_ac = flood(acSeeds, adj)

  // DC seeds with conditional power supply
  const posSeeds = new Set(), negSeeds = new Set()
  nodes.forEach(n=>{
    const t = (n.type||'').toLowerCase()
    n.ports.forEach(p=>{
      const id = (p.id||'').toUpperCase()
      if (t.includes('pv') || t.includes('battery')){
        if (id==='+' || id.includes('+')) posSeeds.add(pk(n.id,p.id))
        if (id==='-' || id.includes('0V') || id.includes('-')) negSeeds.add(pk(n.id,p.id))
      }
    })
    if (t.includes('power supply')){
      const l = pk(n.id,'AC_L'), nn = pk(n.id,'AC_N')
      const powered = P_ac.has(l) && P_ac.has(nn)
      if (powered){
        n.ports.forEach(p=>{
          const id = (p.id||'').toUpperCase()
          if (id.includes('+24') || id==='+' || id==='V+' || id==='VIN+' || id==='VOUT+') posSeeds.add(pk(n.id,p.id))
          if (id==='0V' || id==='-' || id==='V-' || id==='VIN-' || id==='VOUT-') negSeeds.add(pk(n.id,p.id))
        })
      }
    }
  })

  // First DC pass & contactor contacts
  const P1 = flood(posSeeds, adj)
  const N1 = flood(negSeeds, radj)
  let I = new Set([...P1].filter(x => N1.has(x)))
  nodes.forEach(n=>{
    const t = (n.type||'').toLowerCase()
    if (t==='contactor'){
      const a1 = pk(n.id,'A1'), a2 = pk(n.id,'A2')
      const coilOn = I.has(a1) || I.has(a2) || P1.has(a1) || P1.has(a2)
      if (coilOn){
        ;[['L1','T1'],['L2','T2'],['L3','T3']].forEach(([a,b])=>{ const A=pk(n.id,a), B=pk(n.id,b); add(A,B); add(B,A) })
      }
    }
  })

  // Final DC pass
  const P = flood(posSeeds, adj)
  const N = flood(negSeeds, radj)
  I = new Set([...P].filter(x => N.has(x)))

  const energizedConns = new Set()
  edges.forEach(([a,b,id,kind])=>{
    if (kind==='DC'){ if (I.has(a) && I.has(b)) energizedConns.add(id) }
    else { if (P_ac.has(a) && P_ac.has(b)) energizedConns.add(id) }
  })

  return { energizedPorts: I, energizedConns }
}
