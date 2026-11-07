import { Grid } from './grid'
import { type Beam, type Emitter, traceLight } from './light'
import { stepPhysics } from './physics'
import { applyReactions } from './reactions'
import { createRandom } from './rng'

export class World {
  readonly matter: Grid // material of each cell
  readonly light: Grid // color mask of the light in each cell
  readonly sources: Grid // which emitter lit each cell
  emitters: Emitter[] = []
  beams: Beam[] = []
  random: () => number

  constructor(
    readonly width: number,
    readonly height: number,
    seed = 1,
  ) {
    this.matter = new Grid(width, height)
    this.light = new Grid(width, height)
    this.sources = new Grid(width, height)
    this.random = createRandom(seed)
  }

  tick(): void {
    applyReactions(this)
    stepPhysics(this)
    traceLight(this)
  }

  updateLight(): void {
    traceLight(this)
  }

  clear(): void {
    this.matter.fill(0)
    this.light.fill(0)
    this.sources.fill(0)
    this.emitters = []
    this.beams = []
  }
}
