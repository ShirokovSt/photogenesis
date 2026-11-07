import { describe, expect, it } from 'vitest'
import { BLUE, RED, WHITE } from '../src/sim/colors'
import { stampPrism } from '../src/sim/edit'
import { Material } from '../src/sim/materials'
import { World } from '../src/sim/world'

describe('light', () => {
  it('lights every cell along a straight beam', () => {
    const world = new World(20, 10)
    world.emitters.push({ x: 0, y: 5, angle: 0, color: RED })
    world.updateLight()

    for (let x = 0; x < 20; x++) expect(world.light.get(x, 5)).toBe(RED)
    expect(world.light.get(5, 4)).toBe(0)
  })

  it('stops at dust and lights the dust cell', () => {
    const world = new World(20, 10)
    world.matter.set(10, 5, Material.Dust)
    world.emitters.push({ x: 0, y: 5, angle: 0, color: RED })
    world.updateLight()

    expect(world.light.get(10, 5)).toBe(RED)
    expect(world.light.get(11, 5)).toBe(0)
  })

  it('bounces off a mirror', () => {
    const world = new World(20, 20)
    for (let y = 0; y < 20; y++) world.matter.set(10, y, Material.Mirror)
    world.emitters.push({ x: 2, y: 2, angle: 0.3, color: RED })
    world.updateLight()

    expect(world.light.get(4, 6)).toBe(RED) // on the way back
    expect(world.light.get(12, 5)).toBe(0) // nothing behind the mirror
  })

  it('mixes crossing beams', () => {
    const world = new World(20, 20)
    world.emitters.push({ x: 0, y: 10, angle: 0, color: RED })
    world.emitters.push({ x: 10, y: 0, angle: Math.PI / 2, color: BLUE })
    world.updateLight()

    expect(world.light.get(10, 10)).toBe(RED | BLUE)
  })

  it('splits white light into separate colors in a prism', () => {
    const world = new World(120, 80)
    world.emitters.push({ x: 2, y: 40, angle: 0, color: WHITE })
    stampPrism(world, { x: 40, y: 42 }, 14, -Math.PI / 2)
    world.updateLight()

    const colorsBehindPrism = new Set<number>()
    for (let y = 0; y < 80; y++) {
      for (let x = 70; x < 120; x++) colorsBehindPrism.add(world.light.get(x, y))
    }
    expect(colorsBehindPrism).toContain(RED)
    expect(colorsBehindPrism).toContain(BLUE)
  })

  it('records beam paths with bends at surfaces', () => {
    const world = new World(120, 80)
    world.emitters.push({ x: 2, y: 40, angle: 0, color: WHITE })
    stampPrism(world, { x: 40, y: 42 }, 14, -Math.PI / 2)
    world.updateLight()

    const red = world.beams.find((beam) => beam.color === RED)!
    expect(red.points.length).toBeGreaterThan(2)
  })
})
