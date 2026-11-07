import { describe, expect, it } from 'vitest'
import { Material } from '../src/sim/materials'
import { stepPhysics } from '../src/sim/physics'
import { World } from '../src/sim/world'

describe('physics', () => {
  it('dust falls to the floor', () => {
    const world = new World(5, 10)
    world.matter.set(2, 0, Material.Dust)
    for (let i = 0; i < 20; i++) stepPhysics(world)

    expect(world.matter.get(2, 9)).toBe(Material.Dust)
    expect(world.matter.get(2, 0)).toBe(Material.Empty)
  })

  it('dust rests on glass', () => {
    const world = new World(1, 10)
    world.matter.set(0, 5, Material.Glass)
    world.matter.set(0, 0, Material.Dust)
    for (let i = 0; i < 20; i++) stepPhysics(world)

    expect(world.matter.get(0, 4)).toBe(Material.Dust)
  })
})
