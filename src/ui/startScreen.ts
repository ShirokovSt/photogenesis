import logoSvg from '../assets/logo.svg?raw'
import { button, element } from './dom'
import { onLanguageChange, t } from './i18n'
import { languageSwitch } from './languageSwitch'

// An overlay over the running demo scene; removed by the start button
export function showStartScreen(): void {
  const overlay = element('div', 'start-screen')

  const render = () => {
    const text = t()
    const logo = element('div', 'logo')
    logo.innerHTML = logoSvg

    const card = element(
      'div',
      'start-card',
      languageSwitch(),
      logo,
      element('h1', '', text.title),
      element('p', 'tagline', text.tagline),
      ...text.intro.map((line) => element('p', '', line)),
      button(text.start, close, 'primary'),
    )
    overlay.replaceChildren(card)
  }

  const stopListening = onLanguageChange(render)
  const close = () => {
    stopListening()
    overlay.remove()
  }

  render()
  document.body.append(overlay)
}
