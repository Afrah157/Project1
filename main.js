import { GridSystem } from './entities/Grid.js';
import { Shooter } from './entities/Shooter.js';
import { Bubble } from './entities/Bubble.js';
import { BUBBLE_RADIUS, GRID_COLS, GAME_STATE } from './constants.js';
import { LEVELS } from './levels.js';
import { dist, intersectCircle } from './utils/math.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-display');
const levelEl = document.getElementById('level-display');
const modal = document.getElementById('game-over-modal');
const modalTitle = document.getElementById('modal-title');
const modalScore = document.getElementById('modal-score');
const restartBtn = document.getElementById('restart-btn');

// Game Config
let width, height;
let grid, shooter;
let projectile = null; // The moving bubble
let score = 0;
let level = 1;
let state = GAME_STATE.PLAYING;
const PROJECTILE_SPEED = 15;

function resize() {
    const app = document.getElementById('app');
    width = app.clientWidth;
    height = app.clientHeight;
    canvas.width = width;
    canvas.height = height;

    // Reset game center if resize happens
    if (grid) {
        grid.startX = (width - (GRID_COLS * BUBBLE_RADIUS * 2)) / 2 + BUBBLE_RADIUS;
        grid.startY = BUBBLE_RADIUS * 2;
    }
    if (shooter) {
        shooter.x = width / 2;
        shooter.y = height - 50;
    }
}

function init() {
    resize();
    grid = new GridSystem((width - (GRID_COLS * BUBBLE_RADIUS * 2)) / 2 + BUBBLE_RADIUS, BUBBLE_RADIUS * 2);

    // Load current level
    const levelData = LEVELS[(level - 1) % LEVELS.length];
    grid.loadLevel(levelData);

    shooter = new Shooter(width / 2, height - 50);
    // don't reset score if we are just initing the next level... 
    // actually init() is called on restart.
    // Let's split init vs startLevel.
    // For now we assume init is full restart.

    state = GAME_STATE.PLAYING;
    projectile = null;

    updateUI();
    modal.classList.add('hidden');
    modal.classList.remove('active');
}

function nextLevel() {
    level++;
    // If we passed all levels, loop or random?
    // Let's Loop for now

    // Re-init grid but keep score
    grid = new GridSystem((width - (GRID_COLS * BUBBLE_RADIUS * 2)) / 2 + BUBBLE_RADIUS, BUBBLE_RADIUS * 2);
    const levelData = LEVELS[(level - 1) % LEVELS.length];
    grid.loadLevel(levelData);

    projectile = null;
    state = GAME_STATE.PLAYING;
    updateUI();

    // Show a temporary "Level X" toast?
    // For now just update UI
    modalTitle.innerText = `LEVEL ${level}`;
    modalScore.innerText = `Ready?`;
    modal.classList.remove('hidden');
    modal.classList.add('active');
    setTimeout(() => {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }, 1500);
}

function updateUI() {
    scoreEl.innerText = score;
    levelEl.innerText = level;
}

function gameOver(won) {
    state = GAME_STATE.GAME_OVER;
    modalTitle.innerText = won ? 'YOU WIN' : 'GAME OVER';
    modalScore.innerText = `Final Score: ${score}`;
    modal.classList.remove('hidden');
    // slight delay for fade in
    setTimeout(() => modal.classList.add('active'), 10);
}

// Input Handling
window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    if (state !== GAME_STATE.PLAYING) return;
    const rect = canvas.getBoundingClientRect();
    shooter.updateAngle(e.clientX - rect.left, e.clientY - rect.top);
});
canvas.addEventListener('click', () => {
    if (state !== GAME_STATE.PLAYING || projectile) return;

    // Fire!
    projectile = new Bubble(0, 0, shooter.currentColor, shooter.x, shooter.y);
    projectile.vx = Math.cos(shooter.angle) * PROJECTILE_SPEED;
    projectile.vy = Math.sin(shooter.angle) * PROJECTILE_SPEED;

    shooter.swapBubble();
});

restartBtn.addEventListener('click', init);

// Game Loop
function loop() {
    ctx.clearRect(0, 0, width, height);

    if (state === GAME_STATE.PLAYING) {
        grid.draw(ctx);
        shooter.draw(ctx);

        if (projectile) {
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;
            projectile.draw(ctx);

            // Wall Collision
            if (projectile.x - BUBBLE_RADIUS < 0 || projectile.x + BUBBLE_RADIUS > width) {
                projectile.vx *= -1;
                // Clamp to inside to prevent sticking
                if (projectile.x - BUBBLE_RADIUS < 0) projectile.x = BUBBLE_RADIUS;
                if (projectile.x + BUBBLE_RADIUS > width) projectile.x = width - BUBBLE_RADIUS;
            }

            // Ceiling Collision
            if (projectile.y - BUBBLE_RADIUS < 0) {
                snapProjectile();
            }

            // Grid Bubble Collision
            // Optimization: Only check bubbles that are relatively close?
            // For now, iterate all grid bubbles. 140 checks is fine.
            let collision = false;
            for (let r = 0; r < grid.bubbles.length; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    const b = grid.bubbles[r][c];
                    if (b) {
                        if (intersectCircle(projectile, BUBBLE_RADIUS, b, BUBBLE_RADIUS)) {
                            collision = true;
                            break;
                        }
                    }
                }
                if (collision) break;
            }

            if (collision) {
                snapProjectile();
            }
        }
    } else {
        // Draw background game frozen
        grid.draw(ctx);
        shooter.draw(ctx);
    }

    requestAnimationFrame(loop);
}

function snapProjectile() {
    // Determine where to snap
    // Because we moved nicely, we are currently intersecting or just touched.
    // We backtrack slightly to find the ideal "empty" neighbor of the collision?
    // Or just find the nearest empty grid slot to current projectile position.

    const slot = grid.getGridLocation(projectile.x, projectile.y);

    if (slot) {
        const newBubble = grid.placeBubble(slot.row, slot.col, projectile.color);
        projectile = null;

        // Check Matches
        const cluster = grid.findCluster(newBubble);
        if (cluster.length >= 3) {
            // Pop!
            grid.removeBubbles(cluster);
            score += cluster.length * 10;

            // Check Floating
            const floating = grid.findFloatingBubbles();
            grid.removeBubbles(floating);
            score += floating.length * 20;

            // Update Score
            updateUI();

            // Check Level Cleared
            if (grid.isLevelCleared()) {
                nextLevel();
                // Return early to avoid Game Over check on empty grid (which is fine, but logical flow)
                return;
            }
        }

        // Check Game Over
        if (grid.isGameOver()) {
            gameOver(false);
        }
    } else {
        // This happens if the grid is full or glitched. Game Over?
        // Or just delete projectile to save state.
        projectile = null;
        if (grid.isGameOver()) gameOver(false);
    }
}

// Start
init();
loop();
