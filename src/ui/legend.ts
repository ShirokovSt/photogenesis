import { PRIMARIES, cssColor } from '../sim/colors'
import { element } from './dom'
import { onLanguageChange, t } from './i18n'

export function showLegend(container: HTMLElement): void {
  const render = () => {
    const text = t()
    const items = text.legend.map(({ light, text: description }) => {
      const dots = PRIMARIES.filter((color) => light & color).map((color) => {
        const dot = element('span', 'dot')
        dot.style.background = cssColor(color)
        return dot
      })
      return element('li', '', element('span', 'mix', ...dots), description)
    })

    container.replaceChildren(
      element('h2', '', text.legendTitle),
      element('ul', '', ...items),
      element('p', 'shortcuts', text.shortcuts),
    )
  }

  render()
  onLanguageChange(render)
}
