import React from 'react'
import { EXTERNALS } from '../lib/constants.js'
import { isExternal } from '../lib/utils.js'
export default function NodeShape({ node }){
  const { w, h, shape } = node
  const r = 12
  const dash = isExternal(node.type, EXTERNALS) ? '4 3' : undefined
  if (shape === 'circle'){
    return (
      <g>
        <rect x={0} y={0} width={w} height={h} rx={r} ry={r} fill="white" stroke="#e5e7eb" strokeWidth={2} strokeDasharray={dash} />
        <circle cx={w/2} cy={h/2} r={Math.min(w,h)/2 - 14} fill={node.lit ? (node.props?.ledColor==='Red' ? '#ef4444' : node.props?.ledColor==='Yellow' ? '#eab308' : node.props?.ledColor==='Blue' ? '#3b82f6' : node.props?.ledColor==='White' ? '#e5e7eb' : '#10b981') : '#f9fafb'} stroke="#e5e7eb" />
        {node.lit && <circle cx={w/2} cy={h/2} r={Math.min(w,h)/2 - 10} fill="none" stroke={node.props?.ledColor==='Red' ? '#ef4444' : node.props?.ledColor==='Yellow' ? '#eab308' : node.props?.ledColor==='Blue' ? '#3b82f6' : node.props?.ledColor==='White' ? '#e5e7eb' : '#10b981'} strokeOpacity="0.5" />}
      </g>
    )
  }
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={r} ry={r} fill="white" stroke="#e5e7eb" strokeWidth={2} strokeDasharray={dash} />
      <rect x={10} y={10} width={w-20} height={h-20} rx={8} ry={8} fill="#f9fafb" />
    </g>
  )
}
