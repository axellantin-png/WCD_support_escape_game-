export class Board {
  constructor(gridMatrix) {
    this.grid = gridMatrix;
    this.rows = gridMatrix.length;
    this.cols = gridMatrix[0].length;
    this.parkZones = [];
    this.calculateParkZones();
  }

  getTileCode(x, y) {
    if (this.isOutOfBounds(x, y)) return -1;
    return this.grid[y][x];
  }

  isOutOfBounds(x, y) {
    return x < 0 || x >= this.cols || y < 0 || y >= this.rows;
  }

  isBuilding(x, y) {
    return this.getTileCode(x, y) === 0;
  }

  isWater(x, y) {
    return this.getTileCode(x, y) === 2;
  }

  isPark(x, y) {
    const code = this.getTileCode(x, y);
    return code === 1 || code === 9;
  }

  isRoad(x, y) {
    const code = this.getTileCode(x, y);
    return (code >= 3 && code <= 8) || code === 10 || code === 11 || code === 12;
  }

  getRoadDirection(x, y) {
    const code = this.getTileCode(x, y);
    switch (code) {
      case 3: return { dx: 0, dy: -1 };
      case 4: return { dx: 0, dy: 1 };
      case 5: return { dx: -1, dy: 0 };
      case 6: return { dx: 1, dy: 0 };
      case 7: return Math.random() < 0.5 ? { dx: -1, dy: 0 } : { dx: 0, dy: 1 };
      case 8: return Math.random() < 0.5 ? { dx: 1, dy: 0 } : { dx: 0, dy: -1 };
      case 10: return { dx: 1, dy: 0 };
      case 11: return { dx: -1, dy: 0 };
      case 12: return { dx: 0, dy: 1 };
      default: return { dx: 0, dy: 0 };
    }
  }

  // Regroupement des espaces verts par zones contiguës (Flood Fill)
  calculateParkZones() {
    const visited = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
    this.parkZones = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.isPark(c, r) && !visited[r][c]) {
          const zone = [];
          const queue = [{ x: c, y: r }];
          visited[r][c] = true;

          while (queue.length > 0) {
            const current = queue.shift();
            zone.push(current);

            const neighbors = [
              { x: current.x + 1, y: current.y },
              { x: current.x - 1, y: current.y },
              { x: current.x, y: current.y + 1 },
              { x: current.x, y: current.y - 1 }
            ];

            for (const n of neighbors) {
              if (!this.isOutOfBounds(n.x, n.y) && this.isPark(n.x, n.y) && !visited[n.y][n.x]) {
                visited[n.y][n.x] = true;
                queue.push(n);
              }
            }
          }
          this.parkZones.push(zone);
        }
      }
    }
  }

  getParkZoneAt(x, y) {
    return this.parkZones.find(zone => zone.some(tile => tile.x === x && tile.y === y));
  }
}