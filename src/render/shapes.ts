import type { Grid } from '../sim/grid'

// Marching squares: turns blocky cells into smooth outlines.
// Every square joins the centers of four neighboring cells; which of its corners
// lie inside the material picks the polygon to fill and the edge to outline.

// Corners and edge middles of a square
const TL = 0, T = 1, TR = 2, R = 3, BR = 4, B = 5, BL = 6, L = 7
const OFFSETS = [[0, 0], [0.5, 0], [1, 0], [1, 0.5], [1, 1], [0.5, 1], [0, 1], [0, 0.5]]

// Indexed by corners inside: TL = 8, TR = 4, BR = 2, BL = 1
const FILLS = [
  [], [L, B, BL], [B, R, BR], [L, R, BR, BL],
  [T, TR, R], [T, TR, R, B, BL, L], [T, TR, BR, B], [T, TR, BR, BL, L],
  [TL, T, L], [TL, T, B, BL], [TL, T, R, BR, B, L], [TL, T, R, BR, BL],
  [TL, TR, R, L], [TL, TR, R, B, BL], [TL, TR, BR, B, L], [TL, TR, BR, BL],
]

// Pairs of points to connect
const EDGES = [
  [], [L, B], [B, R], [L, R],
  [T, R], [T, L, R, B], [T, B], [T, L],
  [T, L], [T, B], [T, R, B, L], [T, R],
  [L, R], [R, B], [B, L], [],
]

export interface Shape {
  fill: Path2D
  edge: Path2D
}

export function traceShape(matter: Grid, material: number): Shape | null {
  const fill = new Path2D()
  const edge = new Path2D()
  const inside = (x: number, y: number) => (matter.get(x, y) === material ? 1 : 0)
  let found = false

  for (let y = -1; y < matter.height; y++) {
    for (let x = -1; x < matter.width; x++) {
      const corners = inside(x, y) * 8 + inside(x + 1, y) * 4 + inside(x + 1, y + 1) * 2 + inside(x, y + 1)
      if (corners === 0) continue
      found = true

      const pointX = (i: number) => x + 0.5 + OFFSETS[i][0]
      const pointY = (i: number) => y + 0.5 + OFFSETS[i][1]

      FILLS[corners].forEach((p, i) => (i === 0 ? fill.moveTo(pointX(p), pointY(p)) : fill.lineTo(pointX(p), pointY(p))))
      fill.closePath()

      const edges = EDGES[corners]
      for (let i = 0; i < edges.length; i += 2) {
        edge.moveTo(pointX(edges[i]), pointY(edges[i]))
        edge.lineTo(pointX(edges[i + 1]), pointY(edges[i + 1]))
      }
    }
  }
  return found ? { fill, edge } : null
}
