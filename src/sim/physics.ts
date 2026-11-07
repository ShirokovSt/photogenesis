import type { Grid } from './grid'
import { Material } from './materials'
import type { World } from './world'

// Dust falls down and slides off piles. Rows go bottom-up so a grain moves once per tick
export function stepPhysics(world: World): void {
  const { matter } = world
  for (let y = matter.height - 2; y >= 0; y--) {
    const leftToRight = world.random() < 0.5
    for (let i = 0; i < matter.width; i++) {
      const x = leftToRight ? i : matter.width - 1 - i
      if (matter.get(x, y) !== Material.Dust) continue

      const side = world.random() < 0.5 ? -1 : 1
      const target = [x, x + side, x - side].find((tx) => isFree(matter, tx, y + 1))
      if (target !== undefined) {
        matter.set(x, y, Material.Empty)
        matter.set(target, y + 1, Material.Dust)
      }
    }
  }
}

function isFree(matter: Grid, x: number, y: number): boolean {
  return matter.inBounds(x, y) && matter.get(x, y) === Material.Empty
}
