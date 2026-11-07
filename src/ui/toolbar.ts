import logoSvg from '../assets/logo.svg?raw'
import { TOOL_IDS, type ToolId, type Tools } from '../input/tools'
import { cssColor } from '../sim/colors'
import { button, element } from './dom'
import { onLanguageChange, t } from './i18n'
import { languageSwitch } from './languageSwitch'

export interface Simulation {
  paused: boolean
  speed: number
  step(): void
  clear(): void
  loadDemo(): void
}

const SPEEDS = [0.5, 1, 2, 4]

export class Toolbar {
  private readonly toolButtons = new Map<ToolId, HTMLButtonElement>()
  private readonly colorButtons = new Map<number, HTMLButtonElement>()
  private colorGroup = element('div', '')
  private pauseButton = element('button', '')

  constructor(
    private readonly container: HTMLElement,
    private readonly hint: HTMLElement,
    private readonly tools: Tools,
    private readonly simulation: Simulation,
  ) {
    this.render()
    onLanguageChange(() => this.render())
  }

  selectTool(id: ToolId): void {
    this.tools.tool = id
    this.refresh()
  }

  togglePause(): void {
    this.simulation.paused = !this.simulation.paused
    this.refresh()
  }

  // Builds the toolbar from scratch, in the current language
  private render(): void {
    const text = t()
    this.toolButtons.clear()
    this.colorButtons.clear()

    const brand = element('div', 'brand')
    brand.innerHTML = `${logoSvg}<span>${text.title}</span>`

    const toolGroup = element('div', 'group')
    for (const id of TOOL_IDS) {
      const toolButton = button(text.tools[id], () => this.selectTool(id))
      this.toolButtons.set(id, toolButton)
      toolGroup.append(toolButton)
    }

    this.colorGroup = element('div', 'group colors')
    for (const { color, name } of text.colors) {
      const swatch = button('', () => this.selectColor(color), 'swatch')
      swatch.title = name
      swatch.style.background = cssColor(color)
      this.colorButtons.set(color, swatch)
      this.colorGroup.append(swatch)
    }

    this.pauseButton = button('', () => this.togglePause())
    const controls = element(
      'div',
      'group',
      this.pauseButton,
      button(text.step, () => this.simulation.step()),
      this.speedSelect(),
      button(text.clear, () => this.simulation.clear()),
      button(text.demo, () => this.simulation.loadDemo()),
    )

    this.container.replaceChildren(brand, toolGroup, this.colorGroup, controls, languageSwitch())
    this.refresh()
  }

  private selectColor(color: number): void {
    this.tools.color = color
    this.refresh()
  }

  private speedSelect(): HTMLLabelElement {
    const select = element('select', '')
    for (const speed of SPEEDS) {
      const option = element('option', '', `${speed}×`)
      option.value = String(speed)
      option.selected = speed === this.simulation.speed
      select.append(option)
    }
    select.addEventListener('change', () => (this.simulation.speed = Number(select.value)))
    return element('label', 'speed', `${t().speed} `, select)
  }

  private refresh(): void {
    const text = t()
    for (const [id, toolButton] of this.toolButtons) {
      toolButton.classList.toggle('active', id === this.tools.tool)
    }
    for (const [color, swatch] of this.colorButtons) {
      swatch.classList.toggle('active', color === this.tools.color)
    }
    this.colorGroup.classList.toggle('hidden', this.tools.tool !== 'emitter')
    this.pauseButton.textContent = this.simulation.paused ? text.resume : text.pause
    this.hint.textContent = text.toolHints[this.tools.tool]
  }
}
