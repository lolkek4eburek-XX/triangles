    <script>
        const canvas = document.getElementById('gameCanvas');
        const context = canvas.getContext('2d');
        const ambientSound = document.getElementById('ambient');
        const collectSound = document.getElementById('collect');
        const megacollectSound = document.getElementById('megacollect');
        const defeatSound = document.getElementById('defeat');
        const scoreDisplay = document.getElementById('scoreDisplay');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const tileSize = 20;

        const player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 40,
            speed: 3,
            targetX: null,
            targetY: null
        };

        const target = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 20
        };

        const enemy = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 30,
            dx: 2,
            dy: 2
        };

        let score = 0;

        const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };

        function drawGrid() {
            for (let x = 0; x < canvas.width; x += tileSize) {
                for (let y = 0; y < canvas.height; y += tileSize) {
                    context.fillStyle = isInCircle(player, x, y) ? '#AADDFF' :
                        isInCircle(target, x, y) ? '#AAFFAA' :
                            isInCircle(enemy, x, y) ? '#DD0000' :
                                '#FFAAAA';
                    context.fillRect(x, y, tileSize, tileSize);
                }
            }
        }

        function isInCircle(circle, x, y) {
            return Math.hypot(circle.x - x, circle.y - y) <= circle.radius ||
                Math.hypot(circle.x - (x + tileSize), circle.y - y) <= circle.radius ||
                Math.hypot(circle.x - x, circle.y - (y + tileSize)) <= circle.radius ||
                Math.hypot(circle.x - (x + tileSize), circle.y - (y + tileSize)) <= circle.radius;
        }

        function updatePlayerPosition() {
            const moveAmount = 5;

            // Update position based on keyboard input
            if (keys.w || keys.ArrowUp) player.y -= moveAmount;
            if (keys.a || keys.ArrowLeft) player.x -= moveAmount;
            if (keys.s || keys.ArrowDown) player.y += moveAmount;
            if (keys.d || keys.ArrowRight) player.x += moveAmount;

            // Teleport if touching edges
            if (player.x < 0) player.x = canvas.width;
            if (player.x > canvas.width) player.x = 0;
            if (player.y < 0) player.y = canvas.height;
            if (player.y > canvas.height) player.y = 0;

            // Update position based on touch input
            if (player.targetX !== null && player.targetY !== null) {
                const dx = player.targetX - player.x;
                const dy = player.targetY - player.y;
                const distance = Math.hypot(dx, dy);

                if (distance > player.speed) {
                    player.x += (dx / distance) * player.speed;
                    player.y += (dy / distance) * player.speed;
                } else {
                    player.x = player.targetX;
                    player.y = player.targetY;
                    player.targetX = null;
                    player.targetY = null;
                }
            }
        }

        function updateEnemyPosition() {
            enemy.x += enemy.dx;
            enemy.y += enemy.dy;

            // Bounce off the walls
            if (enemy.x + enemy.radius > canvas.width || enemy.x - enemy.radius < 0) {
                enemy.dx *= -1;
            }
            if (enemy.y + enemy.radius > canvas.height || enemy.y - enemy.radius < 0) {
                enemy.dy *= -1;
            }

            // Increase size every 5 points, max size 50 px
            if (score % 5 === 0 && score !== 0 && enemy.radius < 50) {
                enemy.radius++;
            }
        }

        function checkCollision() {
            if (Math.hypot(player.x - target.x, player.y - target.y) <= player.radius + target.radius) {
                score++;
                target.x = Math.random() * canvas.width;
                target.y = Math.random() * canvas.height;

                if (score % 100 === 0) {
                    megacollectSound.play();
                } else {
                    collectSound.play();
                }
                updateScore();
            }

            if (Math.hypot(player.x - enemy.x, player.y - enemy.y) <= player.radius + enemy.radius) {
                defeatSound.play();
                alert("Game Over! Score: " + score);
                document.location.reload();
            }
        }

        function updateScore() {
            scoreDisplay.innerText = "Score: " + score;
        }

        function gameLoop() {
            updatePlayerPosition();
            updateEnemyPosition();
            drawGrid();
            checkCollision();
            requestAnimationFrame(gameLoop);
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'w') keys.w = true;
            if (e.key === 'a') keys.a = true;
            if (e.key === 's') keys.s = true;
            if (e.key === 'd') keys.d = true;
            if (e.key === 'ArrowUp') keys.ArrowUp = true;
            if (e.key === 'ArrowLeft') keys.ArrowLeft = true;
            if (e.key === 'ArrowDown') keys.ArrowDown = true;
            if (e.key === 'ArrowRight') keys.ArrowRight = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'w') keys.w = false;
            if (e.key === 'a') keys.a = false;
            if (e.key === 's') keys.s = false;
            if (e.key === 'd') keys.d = false;
            if (e.key === 'ArrowUp') keys.ArrowUp = false;
            if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
            if (e.key === 'ArrowDown') keys.ArrowDown = false;
            if (e.key === 'ArrowRight') keys.ArrowRight = false;
        });

        canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            player.targetX = touch.clientX - rect.left;
            player.targetY = touch.clientY - rect.top;
        });

        // Play ambient sound on loop
        ambientSound.play();

        gameLoop();
    </script>