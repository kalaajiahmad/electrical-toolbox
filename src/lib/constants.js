export const CONNECTION_TYPES = [
  { key: 'AC', label: 'AC', phases: ['L','N','PE'], palette: { L:'#8B4513', N:'#2563eb', PE:'#16a34a' } },
  { key: 'DC', label: 'DC', phases: ['+','-'], palette: { '+':'#dc2626', '-':'#111111' } },
  { key: 'Signal', label: 'Signal', phases: ['S'], palette: { S:'#6b7280' } },
]

export const CORE_COMPONENTS = {
  'Breaker': { w: 140, h: 88, shape: 'rect', ports: [
    { id: 'L_in', dir: 'in', side: 'left' }, { id: 'N_in', dir: 'in', side: 'left' },
    { id: 'L_out', dir: 'out', side: 'right' }, { id: 'N_out', dir: 'out', side: 'right' },
  ], defaultProps: { system:'AC', voltage:'230V', rating: 'C16', poles: '1P+N', closed: true } },

  'LED': { w: 80, h: 80, shape: 'circle', ports: [
    { id: '+', dir: 'in', side: 'left' }, { id: '-', dir: 'in', side: 'right' },
  ], defaultProps: { system:'DC', voltage:'24V', color: 'Green' } },

  'Meter': { w: 140, h: 90, shape: 'rect', ports: [
    { id: 'L', dir: 'in', side: 'left' }, { id: 'N', dir: 'in', side: 'left' },
  ], defaultProps: { system:'AC', voltage:'230V', type: 'Voltmeter' } },

  'Temp Sensor': { w: 150, h: 88, shape: 'rect', ports: [
    { id: 'V+', dir: 'in', side: 'left' }, { id: 'GND', dir: 'in', side: 'left' }, { id: 'SIG', dir: 'out', side: 'right' },
  ], defaultProps: { system:'DC', voltage:'5V', model: 'NTC 10k' } },

  'Alarm': { w: 120, h: 80, shape: 'rect', ports: [
    { id: '+', dir: 'in', side: 'left' }, { id: '-', dir: 'in', side: 'right' },
  ], defaultProps: { system:'DC', voltage:'24V', level: '24V' } },

  'Regulator': { w: 170, h: 96, shape: 'rect', ports: [
    { id: 'VIN+', dir: 'in', side: 'left' }, { id: 'VIN-', dir: 'in', side: 'left' },
    { id: 'VOUT+', dir: 'out', side: 'right' }, { id: 'VOUT-', dir: 'out', side: 'right' },
  ], defaultProps: { system:'DC', voltage:'24V', in: '48V', out: '24V' } },

  'Contactor': { w: 180, h: 120, shape: 'rect', ports: [
    { id: 'A1', dir: 'in', side: 'top' }, { id: 'A2', dir: 'in', side: 'top' },
    { id: 'L1', dir: 'in', side: 'left' }, { id: 'L2', dir: 'in', side: 'left' }, { id: 'L3', dir: 'in', side: 'left' },
    { id: 'T1', dir: 'out', side: 'right' }, { id: 'T2', dir: 'out', side: 'right' }, { id: 'T3', dir: 'out', side: 'right' },
  ], defaultProps: { system:'AC', voltage:'230V', coil: '24VDC', rating: '32A' } },

  'Terminal': { w: 120, h: 70, shape: 'rect', ports: [
    { id: '1', dir: 'both', side: 'left' }, { id: '2', dir: 'both', side: 'right' },
  ], defaultProps: { system:'Universal', voltage:'—', type: '2-way' } },

  'Fuse': { w: 120, h: 70, shape: 'rect', ports: [
    { id: 'IN', dir: 'in', side: 'left' }, { id: 'OUT', dir: 'out', side: 'right' },
  ], defaultProps: { system:'Universal', voltage:'—', rating: '2A' } },

  'Diode': { w: 120, h: 60, shape: 'rect', ports: [
    { id: 'A', dir: 'both', side: 'left' }, { id: 'K', dir: 'both', side: 'right' },
  ], defaultProps: { system:'DC', voltage:'24V', forward: 'A→K' } },

  'Power Supply': { w: 160, h: 96, shape: 'rect', ports: [
    { id: 'AC_L', dir: 'in', side: 'left' }, { id: 'AC_N', dir: 'in', side: 'left' },
    { id: '+24V', dir: 'out', side: 'right' }, { id: '0V', dir: 'out', side: 'right' },
  ], defaultProps: { system:'AC→DC', voltage:'230→24', in: '230VAC', out: '24VDC' } },
}

export const EXTERNALS = {
  'PV Array': { w: 180, h: 110, shape: 'rect', ports: [
    { id: '+', dir: 'out', side: 'right' }, { id: '-', dir: 'out', side: 'right' },
  ], defaultProps: { system:'DC', voltage:'200-600V', Vmp: '200V', Pmax: '5kW' } },

  'Battery Bank': { w: 180, h: 110, shape: 'rect', ports: [
    { id: '+', dir: 'both', side: 'right' }, { id: '-', dir: 'both', side: 'right' },
  ], defaultProps: { system:'DC', voltage:'48V', V: '48V', Ah: '200Ah' } },

  'Load/House': { w: 200, h: 110, shape: 'rect', ports: [
    { id: 'L', dir: 'in', side: 'left' }, { id: 'N', dir: 'in', side: 'left' }, { id: 'PE', dir: 'in', side: 'left' },
  ], defaultProps: { system:'AC', voltage:'230V', phases: '1P' } },

  'Grid': { w: 200, h: 110, shape: 'rect', ports: [
    { id: 'L', dir: 'out', side: 'right' }, { id: 'N', dir: 'out', side: 'right' }, { id: 'PE', dir: 'out', side: 'right' },
  ], defaultProps: { system:'AC', voltage:'230VAC' } },
}

export const COMPONENT_LIBRARY = { ...CORE_COMPONENTS, ...EXTERNALS }
export const KEY_PROPS_ORDER = ['rating','poles','coil','in','out','V','Ah','model','type','level','system','voltage']
