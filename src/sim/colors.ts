// Light colors are bit masks, so mixing beams is a bitwise OR
export const RED = 0b001
export const GREEN = 0b010
export const BLUE = 0b100

export const YELLOW = RED | GREEN
export const MAGENTA = RED | BLUE
export const CYAN = GREEN | BLUE
export const WHITE = RED | GREEN | BLUE

export const PRIMARIES = [RED, GREEN, BLUE]

export function isPure(color: number): boolean {
  return PRIMARIES.includes(color)
}

// Softer tones than pure 255/0 channels: pure blue looks too dark on screen
const PRIMARY_RGB: [number, [number, number, number]][] = [
  [RED, [255, 70, 70]],
  [GREEN, [70, 255, 120]],
  [BLUE, [80, 140, 255]],
]

export function colorRgb(color: number): [number, number, number] {
  const rgb: [number, number, number] = [0, 0, 0]
  for (const [primary, [r, g, b]] of PRIMARY_RGB) {
    if (!(color & primary)) continue
    rgb[0] = Math.min(255, rgb[0] + r)
    rgb[1] = Math.min(255, rgb[1] + g)
    rgb[2] = Math.min(255, rgb[2] + b)
  }
  return rgb
}

export function rgba([r, g, b]: number[], alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function cssColor(color: number): string {
  return rgba(colorRgb(color), 1)
}
