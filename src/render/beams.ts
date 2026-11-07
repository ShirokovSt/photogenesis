import { colorRgb, rgba } from '../sim/colors'
import type { Beam } from '../sim/light'

// From a wide faint halo to a thin bright core, widths in cells
const PASSES = [
  { width: 5.5, alpha: 0.035 },
  { width: 2.75, alpha: 0.08 },
  { width: 1.25, alpha: 0.22 },
  { width: 0.5, alpha: 0.7 },
]
const CORE = { width: 0.25, alpha: 0.9, whiten: 140 }

export function drawBeams(ctx: CanvasRenderingContext2D, beams: Beam[]): void {
  ctx.save()
  // 'lighter' adds colors up, so crossing beams glow brighter
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (const beam of beams) {
    const path = beamPath(beam)
    const rgb = colorRgb(beam.color)

    for (const { width, alpha } of PASSES) {
      ctx.strokeStyle = rgba(rgb, alpha)
      ctx.lineWidth = width
      ctx.stroke(path)
    }
    ctx.strokeStyle = rgba(rgb.map((c) => Math.min(255, c + CORE.whiten)), CORE.alpha)
    ctx.lineWidth = CORE.width
    ctx.stroke(path)
  }
  ctx.restore()
}

function beamPath(beam: Beam): Path2D {
  const path = new Path2D()
  beam.points.forEach(({ x, y }, i) => (i === 0 ? path.moveTo(x, y) : path.lineTo(x, y)))
  return path
}
