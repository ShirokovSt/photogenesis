export class Grid {
  readonly cells: Uint8Array

  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.cells = new Uint8Array(width * height)
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  // Cells outside the grid read as 0
  get(x: number, y: number): number {
    return this.inBounds(x, y) ? this.cells[y * this.width + x] : 0
  }

  set(x: number, y: number, value: number): void {
    if (this.inBounds(x, y)) this.cells[y * this.width + x] = value
  }

  fill(value: number): void {
    this.cells.fill(value)
  }
}
