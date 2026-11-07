import type { ToolId } from '../input/tools'
import { BLUE, CYAN, GREEN, MAGENTA, RED, WHITE, YELLOW } from '../sim/colors'

export const en = {
  title: 'Photogenesis',
  tagline: 'Light gives birth to matter',
  intro: [
    'Place light emitters, prisms and mirrors.',
    'Where beams of different colors cross, matter appears.',
    'And matter bends the light, so the world keeps rebuilding itself.',
  ],
  start: 'Start',
  language: 'Language',

  tools: {
    emitter: 'Emitter',
    prism: 'Prism',
    glass: 'Glass',
    mirror: 'Mirror',
    eraser: 'Eraser',
  } satisfies Record<ToolId, string>,

  toolHints: {
    emitter: 'Press where to place an emitter and drag toward where it should shine.',
    prism: 'Press where to place a prism and drag to rotate it. It splits white light into colors.',
    glass: 'Paint glass — it bends light.',
    mirror: 'Paint mirrors — they reflect light.',
    eraser: 'Erase matter and emitters.',
  } satisfies Record<ToolId, string>,

  colors: [
    { color: WHITE, name: 'White' },
    { color: RED, name: 'Red' },
    { color: GREEN, name: 'Green' },
    { color: BLUE, name: 'Blue' },
  ],

  pause: 'Pause',
  resume: 'Resume',
  step: 'Step',
  speed: 'Speed',
  clear: 'Clear',
  demo: 'Demo scene',

  legendTitle: 'What light does',
  legend: [
    { light: MAGENTA, text: 'gives birth to crystal — it grows along beams and bends light' },
    { light: YELLOW, text: 'gives birth to dust — it falls and absorbs light' },
    { light: CYAN, text: 'dissolves crystal' },
    { light: WHITE, text: 'burns dust' },
  ],
  shortcuts: 'Space — pause, 1–5 — tools',
}

// The type comes from the English texts, so Russian must have exactly the same keys
export type Strings = typeof en

export const ru: Strings = {
  title: 'Photogenesis',
  tagline: 'Свет рождает материю',
  intro: [
    'Ставь источники света, призмы и зеркала.',
    'Там, где скрещиваются лучи разных цветов, появляется вещество.',
    'А вещество меняет путь света — и мир перестраивается сам.',
  ],
  start: 'Начать',
  language: 'Язык',

  tools: {
    emitter: 'Источник',
    prism: 'Призма',
    glass: 'Стекло',
    mirror: 'Зеркало',
    eraser: 'Ластик',
  },

  toolHints: {
    emitter: 'Нажми, где поставить источник, и потяни туда, куда он будет светить.',
    prism: 'Нажми, где поставить призму, и потяни, чтобы повернуть её. Белый свет она раскладывает на цвета.',
    glass: 'Рисуй стекло — оно преломляет свет.',
    mirror: 'Рисуй зеркала — они отражают свет.',
    eraser: 'Стирай вещество и источники.',
  },

  colors: [
    { color: WHITE, name: 'Белый' },
    { color: RED, name: 'Красный' },
    { color: GREEN, name: 'Зелёный' },
    { color: BLUE, name: 'Синий' },
  ],

  pause: 'Пауза',
  resume: 'Продолжить',
  step: 'Шаг',
  speed: 'Скорость',
  clear: 'Очистить',
  demo: 'Демо-сцена',

  legendTitle: 'Что делает свет',
  legend: [
    { light: MAGENTA, text: 'рождает кристалл — он растёт вдоль лучей и преломляет свет' },
    { light: YELLOW, text: 'рождает пыль — она падает и поглощает свет' },
    { light: CYAN, text: 'растворяет кристалл' },
    { light: WHITE, text: 'сжигает пыль' },
  ],
  shortcuts: 'Пробел — пауза, 1–5 — инструменты',
}
