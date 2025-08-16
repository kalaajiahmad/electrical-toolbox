export const uid = () => Math.random().toString(36).slice(2, 10)
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const ts = () => new Date().toISOString().slice(0, 19)
export const download = (blob, filename) => { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url) }
export const isExternal = (type, externals) => Object.prototype.hasOwnProperty.call(externals, type)
