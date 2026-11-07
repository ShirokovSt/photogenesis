import type { Emitter } from './light'
import { Material } from './materials'
import type { World } from './world'

export interface Point {
  x: number
  y: number
}

const MAX_EMITTERS = 16

export function paintCircle(world: World, center: Point, radius: number, material: Material): void {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) world.matter.set(center.x + dx, center.y + dy, material)
    }
  }
}

export function paintLine(world: World, from: Point, to: Point, radius: number, material: Material): void {
  const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y), 1)
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(from.x + ((to.x - from.x) * i) / steps)
    const y = Math.round(from.y + ((to.y - from.y) * i) / steps)
    paintCircle(world, { x, y }, radius, material)
  }
}

export function addEmitter(world: World, emitter: Emitter): void {
  if (world.emitters.length < MAX_EMITTERS) world.emitters.push(emitter)
}

export function removeEmitters(world: World, center: Point, radius: number): void {
  world.emitters = world.emitters.filter((e) => Math.hypot(e.x - center.x, e.y - center.y) > radius)
}

// An equilateral triangle; `angle` is where its tip points
export function prismCorners(center: Point, radius: number, angle: number): Point[] {
  return [0, 1, 2].map((i) => {
    const a = angle + (i * 2 * Math.PI) / 3
    return { x: center.x + Math.cos(a) * radius, y: center.y + Math.sin(a) * radius }
  })
}

export function stampPrism(world: World, center: Point, radius: number, angle: number): void {
  const corners = prismCorners(center, radius, angle)
  for (let y = Math.floor(center.y - radius); y <= center.y + radius; y++) {
    for (let x = Math.floor(center.x - radius); x <= center.x + radius; x++) {
      if (insideTriangle({ x: x + 0.5, y: y + 0.5 }, corners)) world.matter.set(x, y, Material.Glass)
    }
  }
}

function insideTriangle(p: Point, [a, b, c]: Point[]): boolean {
  const side = (u: Point, v: Point) => (v.x - u.x) * (p.y - u.y) - (v.y - u.y) * (p.x - u.x)
  const s1 = side(a, b)
  const s2 = side(b, c)
  const s3 = side(c, a)
  return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0)
}
