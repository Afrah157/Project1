import { BUBBLE_RADIUS, COLORS } from '../constants.js';

export class Shooter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = -Math.PI / 2; // Pointing up
        this.nextColor = this.getRandomColor();
        this.currentColor = this.getRandomColor();
    }

    getRandomColor() {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    updateAngle(mouseX, mouseY) {
        // Limit angle to prevent shooting too flat
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        let angle = Math.atan2(dy, dx);

        // Clamp angle between -170 deg and -10 deg (roughly)
        // In radians: -2.96 to -0.17
        if (angle < -2.96) angle = -2.96;
        if (angle > -0.17) angle = -0.17;

        // Ensure we only aim upwards
        if (angle > 0) angle = -Math.PI / 2; // Fallback if aiming down

        this.angle = angle;
    }

    swapBubble() {
        this.currentColor = this.nextColor;
        this.nextColor = this.getRandomColor();
    }

    draw(ctx) {
        // Draw Cannon Barrel
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = '#64748b';
        ctx.fillRect(0, -10, 60, 20); // Barrel

        ctx.restore();

        // Draw Base
        ctx.beginPath();
        ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#334155';
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Current Bubble (Loaded)
        ctx.beginPath();
        ctx.arc(this.x, this.y, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = this.currentColor;
        ctx.fill();
        // Shine
        ctx.beginPath();
        ctx.arc(this.x - 5, this.y - 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();

        // Draw Next Bubble (Preview) - Small indicator somewhere
        // Let's put it to the left of the shooter
        ctx.beginPath();
        ctx.arc(this.x - 60, this.y + 10, BUBBLE_RADIUS * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = this.nextColor;
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.fillText('NEXT', this.x - 72, this.y + 35);
    }
}
