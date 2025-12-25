const SPEED_UP = 0.5;
const RANDOM_SPEED_RANGE = 0.3;
const CENTER_WIDTH_RATIO = 0.2;
const BALL_INITIAL_PROPS = { x: 50, y: 50, radius: 8, dx: 3, dy: 3 };
const STAGE_INITIAL_PROPS = { color: '#fff', started: false, startTime: 0, lastSpeedUp: 0 };
let ball = { ...BALL_INITIAL_PROPS };
let stage = { ...STAGE_INITIAL_PROPS };
const c = document.getElementById('c'), ctx = c.getContext('2d');
const sound = { start: new Audio('sounds/start.mp3'), wall: new Audio('sounds/tone_e.mp3'), wallHigh: new Audio('sounds/tone_g.mp3'), racket: new Audio('sounds/tone_c.mp3') };
const racket = { x: 175, y: 470, width: 50, height: 10 };
let displayTextArray = [];
const changeColor = () => '#' + Array.from({ length: 3 }, () => '789abcdef'[Math.floor(Math.random() * 9)]).join('');
const randomSpeed = () => Math.random() * RANDOM_SPEED_RANGE * 2 - RANDOM_SPEED_RANGE;
document.onmousemove = e => racket.x = Math.max(0, Math.min(c.width - racket.width, e.clientX - c.getBoundingClientRect().left - racket.width / 2));
const draw = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height); // Clear canvas
    ctx.fillStyle = stage.color
    displayTextArray = displayTextArray.filter(textObj => Date.now() < textObj.endTime);
    displayTextArray.forEach(textObj => {
        ctx.font = textObj.size + 'px Arial';
        ctx.fillText(textObj.text, textObj.x, textObj.y);
    });
    if (!stage.started) {
        requestAnimationFrame(draw);
        return;
    }
    const leftWidth = racket.width * (1 - CENTER_WIDTH_RATIO) / 2; // Draw racket
    const centerWidth = racket.width * CENTER_WIDTH_RATIO;
    const rightWidth = racket.width * (1 - CENTER_WIDTH_RATIO) / 2;
    ctx.fillRect(racket.x, racket.y, leftWidth, racket.height);
    ctx.fillStyle = '#f0f';
    ctx.fillRect(racket.x + leftWidth, racket.y, centerWidth, racket.height);
    ctx.fillStyle = stage.color;
    ctx.fillRect(racket.x + leftWidth + centerWidth, racket.y, rightWidth, racket.height);
    const currentSec = Math.floor((Date.now() - stage.startTime) / 1000);
    if (currentSec > stage.lastSpeedUp) {
        stage.lastSpeedUp = currentSec;
        ball.dx = ball.dx > 0 ? ball.dx + SPEED_UP : ball.dx - SPEED_UP;
        ball.dy = ball.dy > 0 ? ball.dy + SPEED_UP : ball.dy - SPEED_UP;
    }
    ball.x += ball.dx; // Draw ball
    ball.y += ball.dy;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    const elapsed = ((Date.now() - stage.startTime) / 1000).toFixed(1);
    displayTextArray = displayTextArray.filter(t => t.id !== 'elapsed');
    displayTextArray.push({ id: 'elapsed', text: elapsed + 's', size: 20, x: c.width / 2 - 20, y: 30, endTime: Infinity });
    if (ball.y >= c.height) { // Game over
        const elapsed = ((Date.now() - stage.startTime) / 1000).toFixed(1);
        displayTextArray = [
            { text: 'RESULTS', size: 30, x: 120, y: 180, endTime: Infinity },
            { text: elapsed + 's', size: 30, x: 160, y: 250, endTime: Infinity },
            { text: 'CLICK TO RESTART', size: 30, x: 60, y: 320, endTime: Infinity }
        ];
        stage.started = false;
    }
    else if (ball.x <= ball.radius || ball.x >= c.width - ball.radius) {
        ball.dx = -ball.dx + randomSpeed();
        ball.dy += randomSpeed();
        sound.wall.play();
        stage.color = changeColor();
    }
    else if (ball.y <= ball.radius) {
        ball.dy = -ball.dy + randomSpeed();
        ball.dx += randomSpeed();
        sound.wallHigh.play();
        stage.color = changeColor();
    }
    else if (ball.y >= racket.y - ball.radius && ball.y <= racket.y + racket.height && ball.x >= racket.x && ball.x <= racket.x + racket.width) {
        const centerStart = racket.x + racket.width * (1 - CENTER_WIDTH_RATIO) / 2;
        const centerEnd = racket.x + racket.width * (1 - CENTER_WIDTH_RATIO) / 2 + racket.width * CENTER_WIDTH_RATIO;
        if (ball.x >= centerStart && ball.x <= centerEnd) {
            ball.dy = -BALL_INITIAL_PROPS.dy;
            ball.dx = ball.dx > 0 ? -Math.abs(BALL_INITIAL_PROPS.dx) : Math.abs(BALL_INITIAL_PROPS.dx);
            displayTextArray.push({ text: 'SPEED DOWN', size: 24, x: c.width / 2 - 85, y: c.height / 2, endTime: Date.now() + 1000 });
            sound.start.play();
        } else {
            ball.dy = -ball.dy + randomSpeed();
            ball.dx += randomSpeed();
            sound.racket.play();
        }
        stage.color = changeColor();
    }
    requestAnimationFrame(draw);
}
const start = () => {
    stage = { ...STAGE_INITIAL_PROPS };
    stage.started = true;
    stage.startTime = Date.now();
    ball = { ...BALL_INITIAL_PROPS };
    displayTextArray = [];
    sound.start.play();
};
displayTextArray = [{ text: 'CLICK TO START', size: 30, x: 80, y: 250, endTime: Infinity }];
draw();
c.onclick = () => !stage.started && start();