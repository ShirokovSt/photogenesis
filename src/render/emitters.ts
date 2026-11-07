import { colorRgb, rgba } from '../sim/colors'
import type { Emitter } from '../sim/light'

// Sizes in cells
const BODY_RADIUS = 2.75
const CORE_RADIUS = 1.5
const GLOW_RADIUS = 7.5

// A small device: glowing core, round body and a nozzle facing the beam
export function drawEmitter(ctx: CanvasRenderingContext2D, emitter: Emitter, opacity = 1): void {
  const rgb = colorRgb(emitter.color)
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.translate(emitter.x + 0.5, emitter.y + 0.5)

  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, GLOW_RADIUS)
  glow.addColorStop(0, rgba(rgb, 0.5))
  glow.addColorStop(1, rgba(rgb, 0))
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = glow
  ctx.fillRect(-GLOW_RADIUS, -GLOW_RADIUS, GLOW_RADIUS * 2, GLOW_RADIUS * 2)
  ctx.globalCompositeOperation = 'source-over'

  ctx.rotate(emitter.angle)
  ctx.fillStyle = '#1b2033'
  ctx.strokeStyle = '#59607a'
  ctx.lineWidth = 0.35
  ctx.fillRect(1, -1.25, 3.5, 2.5)
  ctx.strokeRect(1, -1.25, 3.5, 2.5)

  ctx.beginPath()
  ctx.arc(0, 0, BODY_RADIUS, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, 0, CORE_RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = rgba(rgb.map((c) => Math.min(255, c + 120)), 1)
  ctx.fill()
  ctx.restore()
}
