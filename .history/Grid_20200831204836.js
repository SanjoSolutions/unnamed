import { multiply } from './packages/arithmetic/multiply.js';

export class Grid {
  constructor(dimensions) {
    this.dimensions = dimensions
    this.values = new Array(multiply(dimensions))
  }

  _calculateIndex(position) {
    return position.reduce(
      (result, value, index) => result + value * this.dimensions[index]
    )
  }

  get(position) {
    return this.values[this._calculateIndex(position)]
  }

  set(position, value) {
    this.values[this._calculateIndex(position)] = value
  }

  entries() {
    return this._entriesRecursion([])
  }

  _entriesRecursion(position) {
    if (position.length === this.dimensions.length) {
      return [[position, this.get(position)]]
    } else {
      const dimensionSize = this.dimensions[position.length]
      const entries = new Array(dimensionSize)
      for (let coordinate = 0; coordinate < dimensionSize; coordinate++) {
        entries[coordinate] = this._entriesRecursion([...position, coordinate])
      }
      return entries
    }
  }
}