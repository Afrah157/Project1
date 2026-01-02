import { BUBBLE_RADIUS } from '../constants.js';

export class Bubble {
    constructor(row, col, color, x, y) {
        this.row = row;
        this.col = col;
        this.color = color;
        this.x = x;
        this.y = y;
        this.radius = BUBBLE_RADIUS;
        this.markedForRemoval = false;

        // Animation
        this.scale = 0;
        this.targetScale = 1;
    }

    update() {
        if (this.scale < this.targetScale) {
            this.scale += 0.1;
            if (this.scale > this.targetScale) this.scale = this.targetScale;
        }
    }

    draw(ctx) {
        if (this.markedForRemoval) return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * this.scale, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Shine effect
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        ctx.closePath();
    }
}
