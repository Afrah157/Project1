export function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function intersectCircle(c1, r1, c2, r2) {
    return dist(c1.x, c1.y, c2.x, c2.y) < (r1 + r2);
}

// Convert Grid (Row, Col) to Screen (X, Y)
export function getHexPosition(row, col, radius, startX, startY) {
    const width = radius * 2;
    const height = Math.sqrt(3) * radius;

    // Offset every other row
    const xOffset = (row % 2 !== 0) ? width / 2 : 0;

    const x = startX + (col * width) + xOffset;
    const y = startY + (row * height);

    return { x, y };
}
