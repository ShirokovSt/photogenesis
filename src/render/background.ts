const GRID_STEP = 8 // in cells

// Drawn once per resize and reused every frame
export function createBackground(width: number, height: number, cellSize: number): HTMLCanvasElement {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')!

  const gradient = ctx.createRadialGradient(width / 2, height / 2, width * 0.08, width / 2, height / 2, width * 0.65)
  gradient.addColorStop(0, '#111733')
  gradient.addColorStop(1, '#04050b')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(140, 170, 255, 0.05)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= width; x += GRID_STEP * cellSize) {
    ctx.moveTo(Math.round(x) + 0.5, 0)
    ctx.lineTo(Math.round(x) + 0.5, height)
  }
  for (let y = 0; y <= height; y += GRID_STEP * cellSize) {
    ctx.moveTo(0, Math.round(y) + 0.5)
    ctx.lineTo(width, Math.round(y) + 0.5)
  }
  ctx.stroke()
  return canvas
}

// Darkened edges, laid over everything else
export function createVignette(width: number, height: number): HTMLCanvasElement {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(width / 2, height / 2, height * 0.45, width / 2, height / 2, height * 0.95)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.55)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  return canvas
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}
