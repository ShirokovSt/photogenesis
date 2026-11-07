import { PRIMARIES, isPure } from './colors'
import type { Grid } from './grid'
import { Material, materialInfo } from './materials'
import type { World } from './world'

export interface Emitter {
  x: number
  y: number
  angle: number
  color: number
}

interface Ray {
  x: number
  y: number
  dx: number
  dy: number
  color: number
  source: number // emitter number, starting from 1
  stepsLeft: number
}

export interface Vector {
  x: number
  y: number
}

// The path of one ray: where it started, bent and ended. Used for drawing
export interface Beam {
  color: number
  points: Vector[]
}

const STEP = 0.5
const MAX_STEPS = 1500
const MAX_RAYS = 300
const NORMAL_RADIUS = 2

// Marks cells where beams of different emitters meet
export const SEVERAL_SOURCES = 255

export function traceLight(world: World): void {
  world.light.fill(0)
  world.sources.fill(0)
  world.beams = []
  const queue = world.emitters.map(emitterRay)
  for (let traced = 0; queue.length > 0 && traced < MAX_RAYS; traced++) {
    traceRay(queue.pop()!, world, queue)
  }
}

function emitterRay(emitter: Emitter, index: number): Ray {
  return {
    x: emitter.x + 0.5,
    y: emitter.y + 0.5,
    dx: Math.cos(emitter.angle),
    dy: Math.sin(emitter.angle),
    color: emitter.color,
    source: index + 1,
    stepsLeft: MAX_STEPS,
  }
}

// Marches the ray through the grid; split rays are pushed to the queue
function traceRay(ray: Ray, world: World, queue: Ray[]): void {
  const { matter } = world
  let cellX = Math.floor(ray.x)
  let cellY = Math.floor(ray.y)

  const beam: Beam = { color: ray.color, points: [] }
  const addPoint = (x: number, y: number) => beam.points.push({ x, y })
  world.beams.push(beam)
  addPoint(ray.x, ray.y)

  lightUp(world, cellX, cellY, ray)
  if (isOpaque(matter.get(cellX, cellY))) return

  while (ray.stepsLeft-- > 0) {
    const nextX = ray.x + ray.dx * STEP
    const nextY = ray.y + ray.dy * STEP
    const nextCellX = Math.floor(nextX)
    const nextCellY = Math.floor(nextY)

    if (nextCellX !== cellX || nextCellY !== cellY) {
      if (!matter.inBounds(nextCellX, nextCellY)) {
        addPoint(nextX, nextY)
        return
      }

      const from = matter.get(cellX, cellY)
      const to = matter.get(nextCellX, nextCellY)
      const crossedX = nextCellX !== cellX

      if (isOpaque(to)) {
        lightUp(world, nextCellX, nextCellY, ray)
        addPoint(nextX, nextY)
        return
      }

      if (to === Material.Mirror) {
        reflect(ray, facingNormal(matter, ray, nextCellX, nextCellY, crossedX))
        addPoint(ray.x, ray.y)
        continue
      }

      if (from !== to && (isRefractive(from) || isRefractive(to))) {
        // Each color bends differently, so mixed light splits here
        if (!isPure(ray.color)) {
          addPoint(ray.x, ray.y)
          splitRay(ray, queue)
          return
        }
        const [solidX, solidY] = to === Material.Empty ? [cellX, cellY] : [nextCellX, nextCellY]
        const normal = facingNormal(matter, ray, solidX, solidY, crossedX)
        const ratio = refractiveIndex(from, ray.color) / refractiveIndex(to, ray.color)
        const passed = refract(ray, normal, ratio)
        addPoint(ray.x, ray.y)
        if (!passed) continue
      }

      cellX = nextCellX
      cellY = nextCellY
    }

    ray.x = nextX
    ray.y = nextY
    lightUp(world, cellX, cellY, ray)
  }
  addPoint(ray.x, ray.y)
}

function splitRay(ray: Ray, queue: Ray[]): void {
  for (const color of PRIMARIES) {
    if (ray.color & color) queue.push({ ...ray, color })
  }
}

function lightUp(world: World, x: number, y: number, ray: Ray): void {
  const { light, sources } = world
  light.set(x, y, light.get(x, y) | ray.color)

  const source = sources.get(x, y)
  if (source === 0) sources.set(x, y, ray.source)
  else if (source !== ray.source) sources.set(x, y, SEVERAL_SOURCES)
}

function isOpaque(material: number): boolean {
  return materialInfo(material).optics.kind === 'opaque'
}

function isRefractive(material: number): boolean {
  return materialInfo(material).optics.kind === 'refract'
}

function refractiveIndex(material: number, color: number): number {
  const { optics } = materialInfo(material)
  return optics.kind === 'refract' ? optics.index[PRIMARIES.indexOf(color)] : 1
}

// Normal of the surface at a solid cell, turned to face the incoming ray
function facingNormal(matter: Grid, ray: Ray, x: number, y: number, crossedX: boolean): Vector {
  const normal = surfaceNormal(matter, x, y) ?? axisNormal(ray, crossedX)
  if (normal.x * ray.dx + normal.y * ray.dy > 0) {
    normal.x = -normal.x
    normal.y = -normal.y
  }
  return normal
}

// Estimated from the neighbors: points away from the blob the cell belongs to
function surfaceNormal(matter: Grid, x: number, y: number): Vector | null {
  const material = matter.get(x, y)
  let nx = 0
  let ny = 0
  for (let dy = -NORMAL_RADIUS; dy <= NORMAL_RADIUS; dy++) {
    for (let dx = -NORMAL_RADIUS; dx <= NORMAL_RADIUS; dx++) {
      if (matter.get(x + dx, y + dy) !== material) {
        nx += dx
        ny += dy
      }
    }
  }
  const length = Math.hypot(nx, ny)
  return length > 0 ? { x: nx / length, y: ny / length } : null
}

function axisNormal(ray: Ray, crossedX: boolean): Vector {
  return crossedX ? { x: -Math.sign(ray.dx), y: 0 } : { x: 0, y: -Math.sign(ray.dy) }
}

function reflect(ray: Ray, normal: Vector): void {
  const dot = ray.dx * normal.x + ray.dy * normal.y
  ray.dx -= 2 * dot * normal.x
  ray.dy -= 2 * dot * normal.y
}

// Snell's law; returns false on total internal reflection
function refract(ray: Ray, normal: Vector, ratio: number): boolean {
  const cosIn = -(ray.dx * normal.x + ray.dy * normal.y)
  const k = 1 - ratio * ratio * (1 - cosIn * cosIn)
  if (k < 0) {
    reflect(ray, normal)
    return false
  }
  const t = ratio * cosIn - Math.sqrt(k)
  const dx = ratio * ray.dx + t * normal.x
  const dy = ratio * ray.dy + t * normal.y
  const length = Math.hypot(dx, dy)
  ray.dx = dx / length
  ray.dy = dy / length
  return true
}
