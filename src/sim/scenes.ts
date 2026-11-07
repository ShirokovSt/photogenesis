import { BLUE, GREEN, RED, WHITE } from './colors'
import { stampPrism } from './edit'
import type { World } from './world'

const degrees = (value: number) => (value * Math.PI) / 180

// The scene behind the start screen: a prism, a crystal crossing and a dust crossing
export function loadDemoScene(world: World): void {
  world.clear()

  world.emitters.push({ x: 4, y: 52, angle: 0, color: WHITE })
  stampPrism(world, { x: 48, y: 56 }, 14, degrees(-90))

  world.emitters.push({ x: 140, y: 4, angle: degrees(70), color: RED })
  world.emitters.push({ x: 235, y: 60, angle: degrees(180), color: BLUE })

  world.emitters.push({ x: 4, y: 120, angle: degrees(-10), color: RED })
  world.emitters.push({ x: 150, y: 40, angle: degrees(120), color: GREEN })
}
