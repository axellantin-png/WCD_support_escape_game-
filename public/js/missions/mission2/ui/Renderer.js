// mission2/ui/Renderer.js

export class Renderer {
  constructor(boardElement) {
    this.boardElement = boardElement;
    this.tileElements = [];
  }

  renderBoardOnce(board, startPos, targetPos) {
    this.boardElement.innerHTML = '';
    this.tileElements = Array.from({ length: board.rows }, () => Array(board.cols));

    this.boardElement.style.display = 'grid';
    this.boardElement.style.width = '100%';
    this.boardElement.style.gridTemplateColumns = `repeat(${board.cols}, 1fr)`;
    this.boardElement.style.gap = '0';

    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const tileCode = board.getTileCode(c, r);
        const cell = document.createElement('div');
        cell.className = `tile tile-code-${tileCode}`;
        
        // Emboîtement parfait des cases sans micro-trous
        cell.style.cssText = "aspect-ratio: 1/1; position: relative; width: 100%; transform: scale(1.05); margin: -0.1px;";

        if (c === startPos.x && r === startPos.y) {
          cell.innerHTML += `<span style="position:absolute; font-size: 8px; background:blue; color:white; border-radius:50%; padding:1px 2px; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 20;">S</span>`;
        }
        if (c === targetPos.x && r === targetPos.y) {
          cell.innerHTML += `<span style="position:absolute; font-size: 10px; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 20;">🎯</span>`;
        }

        this.boardElement.appendChild(cell);
        this.tileElements[r][c] = cell;
      }
    }
  }

  updateEntities(board, currentPos, cars, wasteIcon = '🎈') {
    const oldEntities = this.boardElement.querySelectorAll('.waste-entity, .car-entity');
    oldEntities.forEach(el => el.remove());

    for (const car of cars) {
      if (!board.isOutOfBounds(car.x, car.y)) {
        const cell = this.tileElements[car.y][car.x];
        const carEl = document.createElement('span');
        carEl.className = 'car-entity';
        carEl.textContent = '🚗';
        carEl.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:0.8rem;";
        cell.appendChild(carEl);
      }
    }

    if (!board.isOutOfBounds(currentPos.x, currentPos.y)) {
      const cell = this.tileElements[currentPos.y][currentPos.x];
      const wasteEl = document.createElement('span');
      wasteEl.className = 'waste-entity';
      wasteEl.textContent = wasteIcon;
      wasteEl.style.cssText = "position:absolute; top:0; left:0; width:100% ; height:100%; display:flex; align-items:center; justify-content:center; font-size:1rem; z-index:10;";
      cell.appendChild(wasteEl);
    }
  }
}