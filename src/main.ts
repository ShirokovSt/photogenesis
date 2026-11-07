import './styles.css'
import logoUrl from './assets/logo.svg'
import { TOOL_IDS, Tools } from './input/tools'
import { Renderer } from './render/renderer'
import { loadDemoScene } from './sim/scenes'
import { World } from './sim/world'
import { currentLanguage } from './ui/i18n'
import { showLegend } from './ui/legend'
import { showStartScreen } from './ui/startScreen'
import { type Simulation, Toolbar } from './ui/toolbar'

const WIDTH = 240
const HEIGHT = 160
const TICK_MS = 1000 / 30
const MAX_FRAME_MS = 250 // after a long pause, don't try to catch up

// Added from code so the single-file build gets the icon inlined too
const favicon = document.createElement('link')
favicon.rel = 'icon'
favicon.href = logoUrl
document.head.append(favicon)

const world = new World(WIDTH, HEIGHT, Date.now())
loadDemoScene(world)

const canvas = document.querySelector<HTMLCanvasElement>('#world')!
const renderer = new Renderer(canvas, world)
const tools = new Tools(canvas, world)

const simulation: Simulation = {
  paused: false,
  speed: 1,
  step: () => world.tick(),
  clear: () => world.clear(),
  loadDemo: () => loadDemoScene(world),
}

const toolbar = new Toolbar(
  document.querySelector('#toolbar')!,
  document.querySelector('#hint')!,
  tools,
  simulation,
)
showLegend(document.querySelector('#legend')!)
showStartScreen()
document.documentElement.lang = currentLanguage()

window.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLSelectElement) return
  if (event.code === 'Space') {
    event.preventDefault()
    toolbar.togglePause()
  }
  const tool = TOOL_IDS[Number(event.key) - 1]
  if (tool) toolbar.selectTool(tool)
})

// Fixed-step simulation: ticks run at the same rate whatever the frame rate is
let lastTime = performance.now()
let pending = 0

function frame(now: number): void {
  if (simulation.paused) {
    world.updateLight()
  } else {
    pending = Math.min(pending + (now - lastTime) * simulation.speed, MAX_FRAME_MS)
    while (pending >= TICK_MS) {
      world.tick()
      pending -= TICK_MS
    }
  }
  lastTime = now
  renderer.draw(tools.preview, now)
  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
