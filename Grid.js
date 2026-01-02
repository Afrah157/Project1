
import { Bubble } from './Bubble.js';
import { GRID_ROWS, GRID_COLS, BUBBLE_RADIUS, COLORS } from '../constants.js';
import { getHexPosition, dist } from '../utils/math.js';

export class GridSystem {
    constructor(startX, startY) {
        this.startX = startX;
        this.startY = startY;
        this.bubbles = []; // 2D Array [row][col]

        this.initGrid();
    }

    initGrid() {
        for (let r = 0; r < GRID_ROWS; r++) {
            this.bubbles[r] = [];
            for (let c = 0; c < GRID_COLS; c++) {
                this.bubbles[r][c] = null;
            }
        }
    }

    loadLevel(levelConfig) {
        const layout = levelConfig.layout;

        for (let r = 0; r < layout.length; r++) {
            const rowData = layout[r];
            for (let c = 0; c < rowData.length; c++) {
                const colorIndex = rowData[c];
                // 0 means empty
                if (colorIndex > 0) {
                    // Check bounds just in case config is weird
                    if (r < GRID_ROWS && c < GRID_COLS) {
                        // colorIndex is 1-based, COLORS is 0-based
                        const color = COLORS[(colorIndex - 1) % COLORS.length];
                        this.placeBubble(r, c, color);
                    }
                }
            }
        }
    }

    isLevelCleared() {
        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                if (this.bubbles[r][c]) return false;
            }
        }
        return true;
    }

    placeBubble(row, col, color) {
        const pos = getHexPosition(row, col, BUBBLE_RADIUS, this.startX, this.startY);
        const bubble = new Bubble(row, col, color, pos.x, pos.y);
        this.bubbles[row][col] = bubble;
        return bubble;
    }

    getNeighbors(row, col) {
        const neighbors = [];
        // Odd-r offset coordinates directions
        // If row is even: (0,-1), (0,1), (-1,-1), (-1,0), (1,-1), (1,0)
        // If row is odd:  (0,-1), (0,1), (-1,0), (-1,1), (1,0), (1,1)

        const parity = row % 2;
        const directions = [
            [0, -1], [0, 1],
            [-1, -(1 - parity)], [-1, parity],
            [1, -(1 - parity)], [1, parity]
        ];

        for (let dir of directions) {
            const nRow = row + dir[0];
            const nCol = col + dir[1];

            if (this.isValid(nRow, nCol) && this.bubbles[nRow][nCol]) {
                neighbors.push(this.bubbles[nRow][nCol]);
            }
        }
        return neighbors;
    }

    isValid(row, col) {
        return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;
    }

    // Find cluster of same-colored bubbles
    findCluster(startBubble) {
        const cluster = [];
        const visited = new Set();
        const stack = [startBubble];
        const color = startBubble.color;

        while (stack.length > 0) {
            const current = stack.pop();
            const id = `${current.row},${current.col}`;

            if (visited.has(id)) continue;
            visited.add(id);
            cluster.push(current);

            const neighbors = this.getNeighbors(current.row, current.col);
            for (let n of neighbors) {
                if (n.color === color) {
                    stack.push(n);
                }
            }
        }
        return cluster;
    }

    // Find all bubbles not connected to the ceiling (floating)
    findFloatingBubbles() {
        const attached = new Set();
        const stack = [];

        // All bubbles in row 0 are attached
        for (let c = 0; c < GRID_COLS; c++) {
            if (this.bubbles[0][c]) {
                stack.push(this.bubbles[0][c]);
            }
        }

        while (stack.length > 0) {
            const current = stack.pop();
            const id = `${current.row},${current.col}`;

            if (attached.has(id)) continue;
            attached.add(id);

            const neighbors = this.getNeighbors(current.row, current.col);
            for (let n of neighbors) {
                stack.push(n);
            }
        }

        const floating = [];
        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                const b = this.bubbles[r][c];
                if (b && !attached.has(`${r},${c}`)) {
                    floating.push(b);
                }
            }
        }
        return floating;
    }

    removeBubbles(bubbleList) {
        for (let b of bubbleList) {
            this.bubbles[b.row][b.col] = null;
        }
    }

    isGameOver() {
        // If any bubble reaches the bottom row
        for (let c = 0; c < GRID_COLS; c++) {
            if (this.bubbles[GRID_ROWS - 1][c]) return true;
        }
        return false;
    }

    // Simplistic text collision based on centers
    // Returns {row, col} or null
    getGridLocation(x, y) {
        // This is a naive approximation, usually you'd do better hex math
        // But checking distance to all centers is robust for small grids
        let count = 0;
        let best = null;
        let minD = Infinity;

        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                // Skip imaginary slots (last col on odd rows might be out of bounds visually)
                if (r % 2 !== 0 && c === GRID_COLS - 1) continue;

                const pos = getHexPosition(r, c, BUBBLE_RADIUS, this.startX, this.startY);
                const d = dist(x, y, pos.x, pos.y);

                // If the slot is empty
                if (!this.bubbles[r][c] && d < BUBBLE_RADIUS * 1.5) {
                    if (d < minD) {
                        minD = d;
                        best = { row: r, col: c };
                    }
                }
            }
        }
        return best;
    }

    draw(ctx) {
        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                if (this.bubbles[r][c]) {
                    this.bubbles[r][c].update();
                    this.bubbles[r][c].draw(ctx);
                }
            }
        }
    }
}
