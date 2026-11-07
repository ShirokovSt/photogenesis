import { colorRgb, rgba } from '../sim/colors'
import type { Grid } from '../sim/grid'
import { Material } from '../sim/materials'
import type { World } from '../sim/world'
import { traceShape } from './shapes'

const CRYSTAL_SHADES = ['#4b1d78', '#8a3fc4', '#c27ff2']
const DUST_SHADES = ['#d8b85a', '#b8953f', '#e9cf7a', '#8f7230', '#c4a24c']
const SPARKLE_EVERY_MS = 200
const SPARKLE_RARITY = 120 // about one crystal cell in this many sparkles

export function drawMatter(ctx: CanvasRenderingContext2D, world: World, time: number): void {
  drawGlass(ctx, world.matter)
  drawMirrors(ctx, world.matter)
  drawCrystals(ctx, world, time)
  drawDust(ctx, world.matter)
}

function drawGlass(ctx: CanvasRenderingContext2D, matter: Grid): void {
  const shape = traceShape(matter, Material.Glass)
  if (!shape) return

  ctx.fillStyle = 'rgba(150, 205, 255, 0.16)'
  ctx.fill(shape.fill)
  ctx.strokeStyle = 'rgba(215, 240, 255, 0.85)'
  ctx.lineWidth = 0.4
  ctx.stroke(shape.edge)
}

function drawMirrors(ctx: CanvasRenderingContext2D, matter: Grid): void {
  const shape = traceShape(matter, Material.Mirror)
  if (!shape) return

  ctx.save()
  ctx.translate(0.4, 0.5)
  ctx.fillStyle = '#141826' // shadow
  ctx.fill(shape.fill)
  ctx.restore()

  ctx.fillStyle = '#cfd8e8'
  ctx.fill(shape.fill)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 0.25
  ctx.stroke(shape.edge)
}

function drawCrystals(ctx: CanvasRenderingContext2D, world: World, time: number): void {
  const { matter, light } = world
  const shape = traceShape(matter, Material.Crystal)
  if (!shape) return

  // Every cell is cut along a diagonal into two triangles of random shades: facets
  const facets = CRYSTAL_SHADES.map(() => new Path2D())
  const sparkles: [number, number][] = []
  const sparkleTime = Math.floor(time / SPARKLE_EVERY_MS)

  forEachCell(matter, Material.Crystal, (x, y) => {
    const hash = cellHash(x, y)
    const first = facets[hash % 3]
    const second = facets[(hash >>> 3) % 3]
    if (hash & 1) {
      addTriangle(first, x, y, x + 1, y, x + 1, y + 1)
      addTriangle(second, x, y, x + 1, y + 1, x, y + 1)
    } else {
      addTriangle(first, x + 1, y, x + 1, y + 1, x, y + 1)
      addTriangle(second, x, y, x + 1, y, x, y + 1)
    }
    if ((hash + sparkleTime) % SPARKLE_RARITY === 0) sparkles.push([x + 0.5, y + 0.5])
  })

  ctx.save()
  ctx.clip(shape.fill)
  facets.forEach((facet, i) => {
    ctx.fillStyle = CRYSTAL_SHADES[i]
    ctx.fill(facet)
  })

  // Light passing through tints the crystal
  ctx.globalCompositeOperation = 'lighter'
  forEachCell(matter, Material.Crystal, (x, y) => {
    const color = light.get(x, y)
    if (color === 0) return
    ctx.fillStyle = rgba(colorRgb(color), 0.25)
    ctx.fillRect(x, y, 1, 1)
  })
  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.strokeStyle = 'rgba(255, 90, 255, 0.12)' // glow around
  ctx.lineWidth = 2
  ctx.stroke(shape.edge)
  drawSparkles(ctx, sparkles)
  ctx.restore()

  ctx.strokeStyle = 'rgba(255, 215, 255, 0.75)'
  ctx.lineWidth = 0.25
  ctx.stroke(shape.edge)
}

function drawSparkles(ctx: CanvasRenderingContext2D, sparkles: [number, number][]): void {
  ctx.strokeStyle = 'rgba(255, 240, 255, 0.9)'
  ctx.lineWidth = 0.2
  ctx.beginPath()
  for (const [x, y] of sparkles) {
    ctx.moveTo(x - 1.2, y)
    ctx.lineTo(x + 1.2, y)
    ctx.moveTo(x, y - 1.2)
    ctx.lineTo(x, y + 1.2)
  }
  ctx.stroke()
}

// Dust grains: one round grain per cell, in a few shades
function drawDust(ctx: CanvasRenderingContext2D, matter: Grid): void {
  const grains = DUST_SHADES.map(() => new Path2D())
  forEachCell(matter, Material.Dust, (x, y) => {
    const grain = grains[cellHash(x, y) % grains.length]
    grain.moveTo(x + 1.05, y + 0.5)
    grain.arc(x + 0.5, y + 0.5, 0.55, 0, Math.PI * 2)
  })
  grains.forEach((grain, i) => {
    ctx.fillStyle = DUST_SHADES[i]
    ctx.fill(grain)
  })
}

function forEachCell(matter: Grid, material: number, callback: (x: number, y: number) => void): void {
  for (let y = 0; y < matter.height; y++) {
    for (let x = 0; x < matter.width; x++) {
      if (matter.get(x, y) === material) callback(x, y)
    }
  }
}

function addTriangle(path: Path2D, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
  path.moveTo(x1, y1)
  path.lineTo(x2, y2)
  path.lineTo(x3, y3)
  path.closePath()
}

// A stable pseudo-random number for a cell
function cellHash(x: number, y: number): number {
  return Math.imul((x * 73856093) ^ (y * 19349663), 0x5bd1e995) >>> 0
}
