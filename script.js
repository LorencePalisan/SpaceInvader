const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player object
const player = {
    x: canvas.width / 2 - 25, // Centered horizontally
    y: canvas.height / 2 - 25, // Centered vertically
    width: 50,
    height: 50,
    color: '#FF0000',
    speed: 5,
};

// Enemy array
const enemies = [];

// Projectiles array
const projectiles = [];

// Game variables
let startTime = new Date().getTime();
let spawnInterval = 1000; // Initial spawn interval in milliseconds
let lastProjectileTime = new Date().getTime(); // Time elapsed since the last projectile

// Kill counter
let killCounter = 0;

// Load the enemy image
const playerImage = new Image();
playerImage.src = 'player.png';
const enemyImage = new Image();
enemyImage.src = 'slime.png';

// Set the initial size of the enemy image
const enemyImageWidth = 30;
const enemyImageHeight = 40;

function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawEnemies() {
    for (const enemy of enemies) {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

function drawProjectiles() {
    ctx.fillStyle = '#00FF00';
    for (const projectile of projectiles) {
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
    }
}

function updatePlayer() {
    if (keysPressed['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keysPressed['ArrowDown'] && player.y + player.height < canvas.height) {
        player.y += player.speed;
    }
    if (keysPressed['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keysPressed['ArrowRight'] && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
}

function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += 2; // Move enemies down
        if (enemies[i].y > canvas.height) {
            // Remove enemies when they go out of the canvas
            enemies.splice(i, 1);
            i--;
        }
        if (checkCollision(player, enemies[i])) {
            // Game over if player collides with an enemy
            alert('Game Over! Time: ' + getElapsedTimeInSeconds() + ' seconds. Kills: ' + killCounter);
            resetGame();
        }
    }
}

function updateProjectiles() {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].y -= 5; // Move projectiles up
        if (projectiles[i].y < 0) {
            // Remove projectiles when they go out of the canvas
            projectiles.splice(i, 1);
            i--;
        } else {
            // Check for collisions with enemies
            for (let j = 0; j < enemies.length; j++) {
                if (checkCollision(projectiles[i], enemies[j])) {
                    // Remove projectile and enemy on collision
                    projectiles.splice(i, 1);
                    enemies.splice(j, 1);
                    i--;

                    // Increment the kill counter
                    killCounter++;
                    break; // Exit the inner loop after a collision
                }
            }
        }
    }
}

function gameLoop() {
    const elapsedTime = getElapsedTimeInSeconds();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawEnemies();
    drawProjectiles();
    updatePlayer();
    updateEnemies();
    updateProjectiles();

    // Increase enemy spawn frequency over time
    spawnInterval = Math.max(500, 1000 - elapsedTime * 10);
    const enemySpeedIncrease = elapsedTime * 0.01;

    // Draw the timer and kill counter on the canvas
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('Time: ' + elapsedTime + ' seconds', 10, 30);
    ctx.fillText('Kills: ' + killCounter, 10, 60);

    // Spawn enemies with the adjusted spawn interval
    if (Math.random() < 0.02) {
        const enemy = {
            x: Math.random() * (canvas.width - enemyImageWidth),
            y: 0,
            width: enemyImageWidth,
            height: enemyImageHeight
        };
        enemies.push(enemy);
    }

    // Automatically shoot projectiles at a regular interval (e.g., every 500 milliseconds)
    const currentTime = new Date().getTime();
    if (currentTime - lastProjectileTime > 100) {
        const projectile = {
            x: player.x + player.width / 2 - 5,
            y: player.y,
            width: 10,
            height: 10
        };
        projectiles.push(projectile);

        // Update the last projectile time
        lastProjectileTime = currentTime;
    }

    requestAnimationFrame(gameLoop);
}

// Keyboard input handling
const keysPressed = {};
window.addEventListener('keydown', (e) => {
    keysPressed[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    delete keysPressed[e.key];
});

function getElapsedTimeInSeconds() {
    const currentTime = new Date().getTime();
    return Math.floor((currentTime - startTime) / 1000);
}

function checkCollision(obj1, obj2) {
    if (!obj1 || !obj2) {
        return false; // Return false if any object is undefined
    }
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}

function resetGame() {
    // Reset player position
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height / 2 - 25;

    // Clear enemies and projectiles arrays
    enemies.length = 0;
    projectiles.length = 0;

    // Reset timer and kill counter
    startTime = new Date().getTime();
    killCounter = 0;
    keysPressed['ArrowUp'] = false;
    keysPressed['ArrowDown'] = false;
    keysPressed['ArrowLeft'] = false;
    keysPressed['ArrowRight'] = false;
}

gameLoop();