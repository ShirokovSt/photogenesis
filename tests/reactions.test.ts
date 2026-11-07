import { describe, expect, it } from 'vitest'
import { BLUE, MAGENTA, RED, WHITE, YELLOW } from '../src/sim/colors'
import { SEVERAL_SOURCES } from '../src/sim/light'
import { Material } from '../src/sim/materials'
import { applyReactions } from '../src/sim/reactions'
import { World } from '../src/sim/world'

// A 3x3 world with one cell lit by two emitters; random() = 0 makes every reaction fire
function litWorld(material: Material, color: number): World {
  const world = new World(3, 3)
  world.matter.set(1, 1, material)
  world.light.set(1, 1, color)
  world.sources.set(1, 1, SEVERAL_SOURCES)
  world.random = () => 0
  return world
}

describe('reactions', () => {
  it('red and blue light give birth to a crystal', () => {
    const world = litWorld(Material.Empty, MAGENTA)
    applyReactions(world)
    expect(world.matter.get(1, 1)).toBe(Material.Crystal)
  })

  it('colors of a single emitter create nothing', () => {
    const world = litWorld(Material.Empty, MAGENTA)
    world.sources.set(1, 1, 1)
    applyReactions(world)
    expect(world.matter.get(1, 1)).toBe(Material.Empty)
  })

  it('red and green light give birth to dust', () => {
    const world = litWorld(Material.Empty, YELLOW)
    applyReactions(world)
    expect(world.matter.get(1, 1)).toBe(Material.Dust)
  })

  it('white light burns dust', () => {
    const world = litWorld(Material.Dust, WHITE)
    applyReactions(world)
    expect(world.matter.get(1, 1)).toBe(Material.Empty)
  })

  it('a single color creates nothing in empty space', () => {
    const world = litWorld(Material.Empty, RED)
    applyReactions(world)
    expect(world.matter.get(1, 1)).toBe(Material.Empty)
  })

  it('a crystal grows into red or blue light next to it', () => {
    const world = litWorld(Material.Empty, BLUE)
    world.matter.set(0, 1, Material.Crystal)
    applyReactions(world)
    expect(world.matter.get(1, 1)).toBe(Material.Crystal)
  })
})
