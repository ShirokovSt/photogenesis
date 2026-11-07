import { BLUE, CYAN, MAGENTA, RED, WHITE, YELLOW } from './colors'
import type { Grid } from './grid'
import { SEVERAL_SOURCES } from './light'
import { Material } from './materials'
import type { World } from './world'

export interface Reaction {
  from: Material
  to: Material
  light: number[] // the cell must be lit by exactly one of these colors
  chance: number // per tick
  crossing?: boolean // beams of different emitters must meet in the cell
  near?: Material // a neighbor of this material is required
}

export const REACTIONS: Reaction[] = [
  { from: Material.Empty, to: Material.Crystal, light: [MAGENTA], crossing: true, chance: 0.05 },
  { from: Material.Empty, to: Material.Crystal, light: [RED, BLUE, MAGENTA], near: Material.Crystal, chance: 0.004 },
  { from: Material.Crystal, to: Material.Empty, light: [CYAN], crossing: true, chance: 0.02 },
  { from: Material.Empty, to: Material.Dust, light: [YELLOW], crossing: true, chance: 0.08 },
  { from: Material.Dust, to: Material.Empty, light: [WHITE], chance: 0.3 },
]

export function applyReactions(world: World): void {
  const { matter, light } = world
  for (let y = 0; y < matter.height; y++) {
    for (let x = 0; x < matter.width; x++) {
      const color = light.get(x, y)
      if (color === 0) continue

      const material = matter.get(x, y)
      for (const reaction of REACTIONS) {
        if (reaction.from !== material || !reaction.light.includes(color)) continue
        if (reaction.crossing && world.sources.get(x, y) !== SEVERAL_SOURCES) continue
        if (reaction.near !== undefined && !hasNeighbor(matter, x, y, reaction.near)) continue
        if (world.random() < reaction.chance) {
          matter.set(x, y, reaction.to)
          break
        }
      }
    }
  }
}

function hasNeighbor(matter: Grid, x: number, y: number, material: Material): boolean {
  return (
    matter.get(x - 1, y) === material ||
    matter.get(x + 1, y) === material ||
    matter.get(x, y - 1) === material ||
    matter.get(x, y + 1) === material
  )
}
