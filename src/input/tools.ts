import type { Preview } from '../render/renderer'
import { WHITE } from '../sim/colors'
import { type Point, addEmitter, paintLine, removeEmitters, stampPrism } from '../sim/edit'
import { Material } from '../sim/materials'
import type { World } from '../sim/world'

export type ToolId = 'emitter' | 'prism' | 'glass' | 'mirror' | 'eraser'
export const TOOL_IDS: ToolId[] = ['emitter', 'prism', 'glass', 'mirror', 'eraser']

const BRUSH_RADIUS = 2
const ERASER_RADIUS = 4
const PRISM_RADIUS = 14
const MIN_DRAG = 2 // shorter drags keep the default direction

const DEFAULT_ANGLE = { emitter: 0, prism: -Math.PI / 2 }

// Turns mouse and touch input on the canvas into world edits
export class Tools {
  tool: ToolId = 'emitter'
  color = WHITE

  private pointer: Point | null = null
  private dragStart: Point | null = null
  private lastPainted: Point | null = null

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly world: World,
  ) {
    canvas.addEventListener('pointerdown', (e) => this.onDown(e))
    canvas.addEventListener('pointermove', (e) => this.onMove(e))
    canvas.addEventListener('pointerup', () => this.onUp())
    canvas.addEventListener('pointerleave', () => (this.pointer = null))
  }

  get preview(): Preview | null {
    if (!this.pointer) return null

    if (this.tool === 'emitter' || this.tool === 'prism') {
      const at = this.dragStart ?? this.pointer
      const angle = this.aimAngle()
      return this.tool === 'emitter'
        ? { kind: 'emitter', at, angle, color: this.color }
        : { kind: 'prism', at, angle, radius: PRISM_RADIUS }
    }
    return { kind: 'brush', at: this.pointer, radius: this.brushRadius() }
  }

  private onDown(event: PointerEvent): void {
    this.canvas.setPointerCapture(event.pointerId)
    const point = this.toCell(event)
    this.pointer = point

    if (this.tool === 'emitter' || this.tool === 'prism') {
      this.dragStart = point
    } else {
      this.paint(point, point)
      this.lastPainted = point
    }
  }

  private onMove(event: PointerEvent): void {
    const point = this.toCell(event)
    this.pointer = point
    if (this.lastPainted) {
      this.paint(this.lastPainted, point)
      this.lastPainted = point
    }
  }

  private onUp(): void {
    if (this.dragStart) this.place(this.dragStart, this.aimAngle())
    this.dragStart = null
    this.lastPainted = null
  }

  private place(at: Point, angle: number): void {
    if (this.tool === 'emitter') addEmitter(this.world, { ...at, angle, color: this.color })
    if (this.tool === 'prism') stampPrism(this.world, at, PRISM_RADIUS, angle)
  }

  private paint(from: Point, to: Point): void {
    const radius = this.brushRadius()
    if (this.tool === 'glass') paintLine(this.world, from, to, radius, Material.Glass)
    if (this.tool === 'mirror') paintLine(this.world, from, to, radius, Material.Mirror)
    if (this.tool === 'eraser') {
      paintLine(this.world, from, to, radius, Material.Empty)
      removeEmitters(this.world, to, radius)
    }
  }

  private aimAngle(): number {
    const defaultAngle = this.tool === 'prism' ? DEFAULT_ANGLE.prism : DEFAULT_ANGLE.emitter
    if (!this.dragStart || !this.pointer) return defaultAngle

    const dx = this.pointer.x - this.dragStart.x
    const dy = this.pointer.y - this.dragStart.y
    return Math.hypot(dx, dy) < MIN_DRAG ? defaultAngle : Math.atan2(dy, dx)
  }

  private brushRadius(): number {
    return this.tool === 'eraser' ? ERASER_RADIUS : BRUSH_RADIUS
  }

  private toCell(event: PointerEvent): Point {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: Math.floor(((event.clientX - rect.left) / rect.width) * this.world.width),
      y: Math.floor(((event.clientY - rect.top) / rect.height) * this.world.height),
    }
  }
}
