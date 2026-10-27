
const canvas = document.getElementById('gameCanvas');
const textElement = document.getElementById("textDisplay");
const scoreElement = document.getElementById("scoreDisplay");

/** @type {WebGL2RenderingContext} */
const gl = initWebGL(canvas);

// score

let score = 0

// turret
const turretPos = { x:0.0, y:-0.8 };
let aimAngle = Math.PI / 2; // radians
const rotationSpeed = 0.04;
let isAimingAtShip = false;

// inputs
const keys = {ArrowLeft: false, ArrowRight: false, Space: false};

// fleet
let activeShips = [];
const shipSize = 0.1;
const shipSpeed = 0.005;
const shipGenTime = 1000;
let lastSpawnTime = 0;

// projectiles
let activeLasers = [];
const laserSpeed = 0.03;
const fireCooldown = 150;
let lastFireTime = 0;

// ship
const shipVertices = [
    0.05, -0.05, 0, 0, 0.1, 0, 0, 0.1, 0.1, 0.1
];
const shipBuffer = createShapeBuffer(gl, shipVertices);

// laser
const laserVertices = [0, 0, 0.1, 0];
const laserBuffer = createShapeBuffer(gl, laserVertices);

// --- SHADER SETUP ---
const vertexShaderSource = `#version 300 es
    precision mediump float;

    in vec3 aPosition;
    uniform vec3 uTranslation;
    uniform float uRotation;

    void main() {
        float s = sin(uRotation);
        float c = cos(uRotation);
        vec2 rotated = vec2(
            aPosition.x * c - aPosition.y * s,
            aPosition.x * s + aPosition.y * c
        );
        gl_Position = vec4(vec3(rotated, 0.0) + uTranslation, 1.0);
    }
`;

const fragmentShaderSource = `#version 300 es
    precision mediump float;
    uniform vec4 uColour;
    out vec4 fragColour;

    void main() {
        fragColour = uColour;
    }
`;

const shaderProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
gl.useProgram(shaderProgram);

const positionAttribute = gl.getAttribLocation(shaderProgram, 'aPosition');
const colourLocation = gl.getUniformLocation(shaderProgram, "uColour");
const translationLocation = gl.getUniformLocation(shaderProgram, "uTranslation");
const rotationLocation = gl.getUniformLocation(shaderProgram, "uRotation");

// build the gun
const turretSegments = 32;
const baseRadius = 0.15;
const turretVertices = [];
for (let i = 0; i <= turretSegments; i++) {
    const angleCircle = (i * 2 * Math.PI) / turretSegments;
    turretVertices.push(baseRadius * Math.cos(angleCircle),
        baseRadius * Math.sin(angleCircle)
    );
}

turretVertices.push(0.0, 0.0, 0.3, 0.0);
const turretBuffer = createShapeBuffer(gl, turretVertices);

// --- RENDER HELPERS ---
function bindStateAndUniforms(buffer, colour, x, y, rotation) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(colourLocation, colour);

    gl.uniform3f(translationLocation, x, y, 0.0);
    gl.uniform1f(rotationLocation, rotation);
}

// draw
function drawGunTurret(x, y, rotation, colour) {
    bindStateAndUniforms(turretBuffer, colour, x, y, rotation);
    gl.drawArrays(gl.LINE_LOOP, 0, turretSegments + 1);
    gl.drawArrays(gl.LINES, turretSegments + 1, 2);
}

function drawShip(x, y) {
    bindStateAndUniforms(shipBuffer, rgbNormal(0, 0, 0), x, y, 0.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 5);
}

function drawLaser(laserInstance) {
    bindStateAndUniforms(laserBuffer, rgbNormal(196, 59, 255), laserInstance.x, laserInstance.y, laserInstance.angle);
    gl.drawArrays(gl.LINES, 0, 2); 
}

// input
function processInput(currentTime) {
    if (!textElement) {
        console.log("textElement not found");
        return;
    }
    if (!scoreElement) {
        console.log("scoreElement not found");
        return;
    }
    else {
        scoreElement.innerText = "Score: " + score;
    }

    if (keys.ArrowLeft && keys.ArrowRight) {
        textElement.innerText = "Both arrows pressed, \nAim angle at " + aimAngle.toFixed(2);
    }
    else if (keys.ArrowLeft) {
        aimAngle += rotationSpeed;
        textElement.innerText = "Left arrow pressed, \nAim angle now " + aimAngle.toFixed(2);
    }
    else if (keys.ArrowRight) {
        aimAngle -= rotationSpeed;
        textElement.innerText = "Right arrow pressed, \nAim angle now " + aimAngle.toFixed(2);
    }
    else {
        textElement.innerText = "Nothing pressed, \nAim angle at " + aimAngle.toFixed(2);
    }

    const elaspedTime = currentTime - lastFireTime;

    if (keys.Space && elaspedTime >= fireCooldown) {
        activeLasers.push({
            x: turretPos.x,
            y: turretPos.y,
            vx: Math.cos(aimAngle) * laserSpeed,
            vy: Math.sin(aimAngle) * laserSpeed,
            angle: aimAngle
        });
        lastFireTime = currentTime;
    }
}

// update
function update(currentTime) {
    if (score <= -10) {
        window.location.replace("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwtY94wcx-ZsbIWs8bI7hOEHbJCfZdFsRGdrVGiV_X9K5_wLEeONcZ1fqj&s=10");
    }
    else if (score >= 10) {
        window.location.replace("https://images.photowall.com/products/60498/smiley-face.jpg?h=699&q=85");
    }

    const elaspedTime = currentTime - lastSpawnTime;
    if (elaspedTime >= shipGenTime) {
        let randomX = (Math.random() * (2.0 - shipSize)) - 1.0;
        activeShips.push({x:randomX, y:1.0});
        lastSpawnTime = currentTime;
    }

    isAimingAtShip = false;

    // turret direction vector
    const turretDirVector = {x:Math.cos(aimAngle), y:Math.sin(aimAngle)};

    for (let i=0; i < activeShips.length; i++) {
        const shipPos = activeShips[i];

        shipPos.y -= shipSpeed;

        // ship centre
        const shipCentre = {x: shipPos.x + (shipSize / 2), y: shipPos.y + (shipSize / 2)};

        // find target direction
        const targetDirVector = {x:shipCentre.x - turretPos.x, y:shipCentre.y - turretPos.y};
        const targetDirLength = Math.sqrt(targetDirVector.x * targetDirVector.x + targetDirVector.y * targetDirVector.y);
        const unitTargetDirVector = {x: targetDirVector.x / targetDirLength, y:targetDirVector.y / targetDirLength};

        if (targetDirLength > 0) {
            const dotProduct = getDotProduct(turretDirVector, unitTargetDirVector);
            if (dotProduct > 0.98) {
                isAimingAtShip = true;
            }
        }

        if (shipPos.y > 1.1 || shipPos.x > 1.1 || shipPos.x < -1.1 || shipPos.y < -1.1) {
            activeShips.splice(i, 1);
            score += 1;
            continue;
        }
    }

    for (let i=0; i < activeLasers.length; i++) {
        const laser = activeLasers[i];
        laser.x += laser.vx;
        laser.y += laser.vy;

        if (laser.y > 1.1 || laser.x > 1.1 || laser.x < -1.1 || laser.y < -1.1) {
            activeLasers.splice(i, 1);
            continue;
        }

        for (let j=activeShips.length-1; j>=0; j--) {
            const shipPos = activeShips[j];
            if (
                laser.x >= shipPos.x &&
                laser.x <= shipPos.x + shipSize &&
                laser.y >= shipPos.y &&
                laser.y <= shipPos.y + shipSize
            ) {
                activeShips.splice(j, 1);
                activeLasers.splice(i, 1);
                score -= 1;
                break;
            }
        }
    }
}

// --- RENDER ---
function render() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT);

    let turretColour = rgbNormal(92, 157, 195);
    
    if (isAimingAtShip) {
        turretColour = rgbNormal(255, 0, 0);
    }

    for (let i=0; i < activeLasers.length; i++) {
        drawLaser(activeLasers[i]);
    }

    drawGunTurret(turretPos.x, turretPos.y, aimAngle, turretColour);

    for (let i=0; i < activeShips.length; i++) {
        const shipPos = activeShips[i];
        drawShip(shipPos.x, shipPos.y);
    }
}

// main loop
function gameLoop(timestamp) {
    processInput(timestamp);
    update(timestamp);
    render();
    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        keys[event.key] = true;
        event.preventDefault();
    }
    if (event.key === " " || event.code === "Space") {
        keys.Space = true;
        event.preventDefault();
    }
});

window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        keys[event.key] = false;
        event.preventDefault();
    }
    if (event.key === " " || event.code === "Space") {
        keys.Space = false;
        event.preventDefault();
    }
});

// execute
requestAnimationFrame(gameLoop);