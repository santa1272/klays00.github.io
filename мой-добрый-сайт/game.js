// game.js — мини-игра «Добрый Прыгун»
(function(){
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreSpan = document.getElementById('gameScore');
    const finalScoreSpan = document.getElementById('finalScore');
    const gameOverlay = document.getElementById('gameOverlay');
    const restartBtn = document.getElementById('restartGame');
    const hintText = document.getElementById('gameHint');

    // Размеры canvas
    const CW = 800;
    const CH = 300;
    canvas.width = CW;
    canvas.height = CH;

    // Игровые переменные
    let gameActive = false;
    let score = 0;
    let frame = 0;
    let obstacles = [];
    let hearts = [];

    // Игрок
    const player = {
        x: 100,
        y: CH - 50,
        width: 30,
        height: 30,
        vy: 0,
        gravity: 0.8,
        jumpPower: -12,
        grounded: true
    };

    // Сброс игры
    function resetGame() {
        gameActive = true;
        score = 0;
        frame = 0;
        obstacles = [];
        hearts = [];
        player.y = CH - 50;
        player.vy = 0;
        gameOverlay.classList.add('hidden');
        hintText.style.opacity = '1';
        updateScore();
    }

    // Обновление счётчика на экране
    function updateScore() {
        scoreSpan.textContent = score;
    }

    // Прыжок
    function jump() {
        if (!gameActive) return;
        if (player.y >= CH - 50 - 5) {
            player.vy = player.jumpPower;
        }
    }

    // Увеличение глобального счётчика помощи (вызов функции из index.html)
    async function addGlobalHelp() {
        if (typeof window.incrementGlobalFromGame === 'function') {
            await window.incrementGlobalFromGame();
        }
    }

    // Генерация препятствий и сердец
    function spawnObjects() {
        // Препятствие (примерно каждые 80 кадров)
        if (frame % 80 === 0 && gameActive) {
            obstacles.push({
                x: CW,
                y: CH - 40,
                width: 20,
                height: 30,
                speed: 5
            });
        }
        // Сердечко (каждые 50 кадров)
        if (frame % 50 === 0 && gameActive) {
            hearts.push({
                x: CW,
                y: CH - 80,
                width: 20,
                height: 20,
                speed: 4
            });
        }
    }

    // Обновление логики
    function update() {
        if (!gameActive) return;

        // Физика игрока
        player.vy += player.gravity;
        player.y += player.vy;
        if (player.y >= CH - 50) {
            player.y = CH - 50;
            player.vy = 0;
        }

        // Движение объектов
        obstacles = obstacles.filter(obj => {
            obj.x -= obj.speed;
            // Столкновение
            if (obj.x < player.x + player.width &&
                obj.x + obj.width > player.x &&
                obj.y < player.y + player.height &&
                obj.y + obj.height > player.y) {
                gameActive = false;
                gameOverlay.classList.remove('hidden');
                finalScoreSpan.textContent = score;
                hintText.style.opacity = '0';
                // Проверка на увеличение глобальной помощи при окончании игры
                const helpIncrements = Math.floor(score / 50);
                for (let i = 0; i < helpIncrements; i++) {
                    addGlobalHelp();
                }
            }
            return obj.x + obj.width > 0;
        });

        hearts = hearts.filter(h => {
            h.x -= h.speed;
            // Сбор сердечка
            if (h.x < player.x + player.width &&
                h.x + h.width > player.x &&
                h.y < player.y + player.height &&
                h.y + h.height > player.y) {
                score += 10;
                updateScore();
                // Каждые 50 очков +1 к глобальной помощи
                if (score % 50 === 0) {
                    addGlobalHelp();
                }
                return false;
            }
            return h.x + h.width > 0;
        });

        frame++;
        spawnObjects();
    }

    // Отрисовка
    function draw() {
        ctx.clearRect(0, 0, CW, CH);
        // Земля
        ctx.fillStyle = '#5a3e2b';
        ctx.fillRect(0, CH - 20, CW, 20);
        ctx.fillStyle = '#8b5e3c';
        ctx.fillRect(0, CH - 15, CW, 5);

        // Игрок (добрый динозаврик / квадратик)
        ctx.fillStyle = '#667eea';
        ctx.shadowColor = '#a0f0a0';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(player.x, player.y, player.width, player.height, 8);
        ctx.fill();
        // Глаз
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(player.x + 22, player.y + 10, 5, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = '#1a202c';
        ctx.beginPath();
        ctx.arc(player.x + 24, player.y + 8, 3, 0, 2*Math.PI);
        ctx.fill();

        // Препятствия
        ctx.fillStyle = '#c0392b';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#7b241c';
        obstacles.forEach(obj => {
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        });

        // Сердечки
        ctx.fillStyle = '#e74c3c';
        ctx.shadowColor = '#ff9999';
        hearts.forEach(h => {
            // Простое сердечко
            ctx.beginPath();
            ctx.moveTo(h.x + 10, h.y + 5);
            ctx.bezierCurveTo(h.x, h.y - 5, h.x - 10, h.y + 5, h.x + 10, h.y + 20);
            ctx.bezierCurveTo(h.x + 30, h.y + 5, h.x + 20, h.y - 5, h.x + 10, h.y + 5);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    }

    // Игровой цикл
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Инициализация
    function init() {
        resetGame();
        // События управления
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                jump();
            }
        });
        canvas.addEventListener('click', () => jump());
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
        restartBtn.addEventListener('click', () => resetGame());
        gameLoop();
    }

    // Добавляем roundRect
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
    };

    init();
})();