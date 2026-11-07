import { cssColor } from '../sim/colors'
import { type Point, prismCorners } from '../sim/edit'
import type { World } from '../sim/world'
import { createBackground, createVignette } from './background'
import { drawBeams } from './beams'
import { drawEmitter } from './emitters'
import { drawMatter } from './matter'

export type Preview =
  | { kind: 'emitter'; at: Point; angle: number; color: number }
  | { kind: 'prism'; at: Point; radius: number; angle: number }
  | { kind: 'brush'; at: Point; radius: number }

const AIM_LENGTH = 16 // in cells

// Draws at the real screen resolution; the simulation grid is only the data
export class Renderer {
  private readonly context: CanvasRenderingContext2D
  private scale = 1 // screen pixels per cell
  private background = document.createElement('canvas')
  private vignette = document.createElement('canvas')

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly world: World,
  ) {
    this.context = canvas.getContext('2d')!
    new ResizeObserver(() => this.resize()).observe(canvas)
    this.resize()
  }

  draw(preview: Preview | null, time: number): void {
    const ctx = this.context
    if (this.canvas.width === 0 || this.canvas.height === 0) return

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.drawImage(this.background, 0, 0)

    // From here on one unit is one cell
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0)
    drawBeams(ctx, this.world.beams)
    drawMatter(ctx, this.world, time)
    for (const emitter of this.world.emitters) drawEmitter(ctx, emitter)
    if (preview) drawPreview(ctx, preview)

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.drawImage(this.vignette, 0, 0)
  }

  private resize(): void {
    const ratio = window.devicePixelRatio || 1
    const width = Math.round(this.canvas.clientWidth * ratio)
    const height = Math.round(this.canvas.clientHeight * ratio)
    this.canvas.width = width
    this.canvas.height = height
    this.scale = width / this.world.width
    if (width === 0 || height === 0) return

    this.background = createBackground(width, height, this.scale)
    this.vignette = createVignette(width, height)
  }
}

function drawPreview(ctx: CanvasRenderingContext2D, preview: Preview): void {
  const { x, y } = preview.at
  ctx.save()
  ctx.lineWidth = 0.3
  ctx.setLineDash([1, 1])
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.beginPath()

  if (preview.kind === 'emitter') {
    drawEmitter(ctx, { x, y, angle: preview.angle, color: preview.color }, 0.6)
    ctx.strokeStyle = cssColor(preview.color)
    ctx.moveTo(x + 0.5, y + 0.5)
    ctx.lineTo(x + 0.5 + Math.cos(preview.angle) * AIM_LENGTH, y + 0.5 + Math.sin(preview.angle) * AIM_LENGTH)
  } else if (preview.kind === 'prism') {
    prismCorners(preview.at, preview.radius, preview.angle).forEach((c, i) =>
      i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y),
    )
    ctx.closePath()
  } else {
    ctx.arc(x + 0.5, y + 0.5, preview.radius + 0.5, 0, Math.PI * 2)
  }
  ctx.stroke()
  ctx.restore()
}
