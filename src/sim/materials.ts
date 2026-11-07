export const Material = {
  Empty: 0,
  Glass: 1,
  Mirror: 2,
  Crystal: 3,
  Dust: 4,
} as const

export type Material = (typeof Material)[keyof typeof Material]

// How a material treats light
export type Optics =
  | { kind: 'clear' }
  | { kind: 'refract'; index: [red: number, green: number, blue: number] }
  | { kind: 'mirror' }
  | { kind: 'opaque' }

interface MaterialInfo {
  color: [number, number, number]
  optics: Optics
}

export const MATERIALS: Record<Material, MaterialInfo> = {
  [Material.Empty]: { color: [8, 8, 14], optics: { kind: 'clear' } },
  [Material.Glass]: { color: [60, 95, 125], optics: { kind: 'refract', index: [1.3, 1.38, 1.46] } },
  [Material.Mirror]: { color: [205, 215, 230], optics: { kind: 'mirror' } },
  [Material.Crystal]: { color: [150, 60, 190], optics: { kind: 'refract', index: [1.15, 1.2, 1.25] } },
  [Material.Dust]: { color: [140, 120, 60], optics: { kind: 'opaque' } },
}

export function materialInfo(material: number): MaterialInfo {
  return MATERIALS[material as Material]
}
