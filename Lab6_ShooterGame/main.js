
const canvas = document.getElementById('gameCanvas');
const textElement = document.getElementById("textDisplay");
const scoreElement = document.getElementById("scoreDisplay");

/** @type {WebGL2RenderingContext} */
const gl = initWebGL(canvas);

// inputs
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    r: false,
    w: false,
    a: false,
    s: false,
    d: false
};

// playable boundary

const rightBoundary = 1.95;
const leftBoundary = -1.95;
const topBoundary = 1.95;
const bottomBoundary = -1.95;

// global game variables
const GameState = Object.freeze({
    PLAYING: "playing",
    GAME_WON: "game_won",
    GAME_LOST: "game_lost"
});

/** @type {string} */
let currentGameState = GameState.PLAYING;

// --- SHADER SETUP ---
const vertexShaderSource = `#version 300 es
    precision mediump float;

    in vec3 aPosition;
    uniform vec3 uTranslation;
    uniform float uRotation;
    uniform vec3 uScale;

    void main() {
        vec3 scaled = aPosition * uScale;
        float s = sin(uRotation);
        float c = cos(uRotation);
        vec2 rotated = vec2(
            scaled.x * c - scaled.y * s,
            scaled.x * s + scaled.y * c
        );
        gl_Position = vec4((vec3(rotated, 0.0) + uTranslation) / 2.0, 1.0);
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
const scaleLocation = gl.getUniformLocation(shaderProgram, "uScale");

// turret
const turretsPos = [
    { x:-1.8, y:-1.8 },
    { x:0.0, y:-1.8 },
    { x:1.8, y:-1.8 }
];

const aimAngles = [
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2
];

let isAimingAtShip = [
    false,
    false,
    false
]

const rotationSpeed = 0.01;

// player
const playerPos = { x: 0.0, y: 1.6, z: 0.0};
const playerSpeed = 0.015;
const playerSize = 0.15;
const playerRadius = 0.04;

const playerMaxHealth = 100;
let playerHealth = playerMaxHealth;

const playerVertices = [
    0.0, 0.5,
    -0.4, -0.5,
    0.0, -0.2,
    0.4, -0.5
];

const playerIndices = [
    0, 1, 2,
    0, 2, 3
];

const playerMesh = createMesh(gl, playerVertices, playerIndices, positionAttribute)

// asteroids
const asteroids = [
    { x: randfloat(-1.8, 1.8), y: randfloat(-1.2, 1.2), radius: randfloat(0.12, 0.24) },
    { x: randfloat(-1.8, 1.8), y: randfloat(-1.2, 1.2), radius: randfloat(0.12, 0.24) },
    { x: randfloat(-1.8, 1.8), y: randfloat(-1.2, 1.2), radius: randfloat(0.12, 0.24) },
    { x: randfloat(-1.8, 1.8), y: randfloat(-1.2, 1.2), radius: randfloat(0.12, 0.24) },
    { x: randfloat(-1.8, 1.8), y: randfloat(-1.2, 1.2), radius: randfloat(0.12, 0.24) },
    { x: randfloat(-1.8, 1.8), y: randfloat(-1.2, 1.2), radius: randfloat(0.12, 0.24) }
]

const asteroidSegments = 24;
const asteroidVertices = [];
const asteroidIndices = [];
for (let i = 0; i <= asteroidSegments; i++) {
    const angleCircle = (i * 2 * Math.PI) / asteroidSegments;
    asteroidVertices.push(Math.cos(angleCircle), Math.sin(angleCircle));
    asteroidIndices.push(i);
}
const asteroidMesh = createMesh(gl, asteroidVertices, asteroidIndices, positionAttribute);

// projectiles
let activeLasers = [];
const laserSpeed = 0.03;
const fireCooldown = 450;
let lastFireTime = 0;

// laser
const laserVertices = [0, 0, 0.1, 0];
const laserIndices = [0, 1];
const laserMesh = createMesh(gl, laserVertices, laserIndices, positionAttribute);

// build the gun
const turretSegments = 32;
const baseRadius = 0.15;
const turretVertices = [];
const turretIndices = [];
for (let i = 0; i <= turretSegments; i++) {
    const angleCircle = (i * 2 * Math.PI) / turretSegments;
    turretVertices.push(baseRadius * Math.cos(angleCircle),
        baseRadius * Math.sin(angleCircle)
    );
    turretIndices.push(i);
}
const barrelIndex = turretSegments + 1;
turretVertices.push(0, 0, 0.3, 0);
turretIndices.push(barrelIndex, barrelIndex + 1);
const turretMesh = createMesh(gl, turretVertices, turretIndices, positionAttribute);

turretVertices.push(0.0, 0.0, 0.3, 0.0);
const turretBuffer = createShapeBuffer(gl, turretVertices);

// --- RENDER HELPERS ---
function setUniforms(colour, transX, transY, rotation, scale = 1.0) {
    gl.uniform4fv(colourLocation, colour);
    gl.uniform3f(translationLocation, transX, transY, 0.0);
    gl.uniform1f(rotationLocation, rotation);
    gl.uniform3f(scaleLocation, scale, scale, 1.0);
}

// draw
function drawGunTurret(x, y, rotation, colour) {
    gl.bindVertexArray(turretMesh.vao);
    setUniforms(colour, x, y, rotation);
    gl.drawArrays(gl.LINE_LOOP, 0, turretSegments + 1);
    gl.drawArrays(gl.LINES, turretSegments + 1, 2);
    gl.drawElements(gl.LINE_LOOP, turretSegments + 1, gl.UNSIGNED_SHORT, 0);
    gl.drawElements(gl.LINES, 2, gl.UNSIGNED_SHORT, (turretSegments + 1) * 2);
}

function drawLaser(laserInstance) {
    gl.bindVertexArray(laserMesh.vao);
    setUniforms([0.0, 0.4, 0.8, 1.0], laserInstance.x, laserInstance.y, laserInstance.angle);
    gl.drawElements(gl.LINES, laserMesh.indexCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
}

function drawPlayer(currentPlayerPos) {
    gl.bindVertexArray(playerMesh.vao);
    setUniforms([0.0, 0.4, 0.8, 1.0], currentPlayerPos.x, currentPlayerPos.y, Math.PI, playerSize);
    gl.drawElements(gl.TRIANGLES, playerMesh.indexCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
}

function drawAsteroid(x, y, radius) {
    gl.bindVertexArray(asteroidMesh.vao);
    setUniforms([0.4, 0.4, 0.4, 1.0], x, y, 0.0, radius);
    gl.drawElements(gl.TRIANGLE_FAN, asteroidMesh.indexCount, gl.UNSIGNED_SHORT, 0);
}

// --------- INIT ----------

function init() {
    const currentTime = performance.now();
    lastFireTime = currentTime + 2000; // 2 second delay

    if (textElement) {
        textElement.innerText = "Dodge the lasers and reach the bottom!";
    }
}

// input
function processInput(currentTime) {
    if (currentGameState !== GameState.PLAYING) {
        if (keys.Space) {
            currentGameState = GameState.PLAYING;
        }
        else {
            return;
        }
    }

    if (keys.r) {
        console.log("SPACE")
    }

    const prevX = playerPos.x;
    const prevy = playerPos.y;

    if (!textElement) {
        console.log("textElement not found");
        return;
    }
    if (!scoreElement) {
        console.log("scoreElement not found");
        return;
    }
    else {
        scoreElement.innerText = "Health: " + playerHealth;
    }

    // player movement

    if (keys.ArrowUp || keys.w) playerPos.y += playerSpeed;
    if (keys.ArrowDown || keys.s) playerPos.y -= playerSpeed;
    if (keys.ArrowLeft || keys.a) playerPos.x -= playerSpeed;
    if (keys.ArrowRight || keys.d) playerPos.x += playerSpeed;
    
    if (playerPos.x > rightBoundary) playerPos.x = rightBoundary;
    if (playerPos.x < leftBoundary) playerPos.x = leftBoundary;
    if (playerPos.y > topBoundary) playerPos.y = topBoundary;

    let hitAsteroid = false;

    for (let i=0; i<asteroids.length; i++) {
        const asteroid = asteroids[i];
        const dx = playerPos.x - asteroid.x;
        const dy = playerPos.y - asteroid.y;
        if (Math.sqrt(dx*dx + dy*dy) < playerRadius + asteroid.radius) {
            hitAsteroid = true;
            break;
        }
    }

    if (hitAsteroid) {
        playerPos.x = prevX;
        playerPos.y = prevy;
    }
}

// update
function update(currentTime) {
    if (currentGameState !== GameState.PLAYING) {
        return;
    }

    if (playerPos.y < bottomBoundary) {
        currentGameState = GameState.GAME_WON;

        if (textElement) {
            textElement.innerText = "Mission Acomplished!";
        }
        return;
    }

    isAimingAtShip = [
        false,
        false,
        false
    ]

    for (let i=0; i<turretsPos.length; i++) {
        // turret direction vector
        const turretDirVector = {x: Math.cos(aimAngles[i]), y: Math.sin(aimAngles[i])};
        // find target direction
        const targetDirVector = {x: playerPos.x - turretsPos[i].x, y: playerPos.y - turretsPos[i].y};
        const targetDirLength = Math.sqrt(targetDirVector.x * targetDirVector.x + targetDirVector.y * targetDirVector.y);
        const unitTargetDirVector = {x: targetDirVector.x / targetDirLength, y:targetDirVector.y / targetDirLength};

        if (targetDirLength > 0) {
            const dotProduct = getDotProduct(turretDirVector, unitTargetDirVector);
            if (dotProduct > 0.995) {
                isAimingAtShip[i] = true;
                if (currentTime - lastFireTime >= fireCooldown) {
                    activeLasers.push({
                        x: turretsPos[i].x,
                        y: turretsPos[i].y,
                        vx: Math.cos(aimAngles[i]) * laserSpeed,
                        vy: Math.sin(aimAngles[i]) * laserSpeed,
                        angle: aimAngles[i]
                    });
                    lastFireTime = currentTime;
                }
            }

            const crossProduct = getCrossProduct(turretDirVector, unitTargetDirVector);
            if (Math.abs(crossProduct.z) > 0.02) {
                aimAngles[i] += Math.sign(crossProduct.z) * rotationSpeed;
            }
        }
    }

    for (let i=0; i < activeLasers.length; i++) {
        const laser = activeLasers[i];
        laser.x += laser.vx;
        laser.y += laser.vy;

        let laserBlocked = false;
        for (let j=0; j < asteroids.length; j++) {
            const asteroid = asteroids[j];
            const ldx = laser.x - asteroid.x;
            const ldy = laser.y - asteroid.y;
            if (Math.sqrt(ldx * ldx + ldy * ldy) < asteroid.radius) {
                laserBlocked = true;
                break;
            }
        }


        if (laser.y > 2.1 || laser.x > 2.1 || laser.x < -2.1 || laser.y < -2.1 || laserBlocked) {
            activeLasers.splice(i, 1);
            continue;
        }

        const dx = laser.x - playerPos.x;
        const dy = laser.y - playerPos.y;
        if (Math.sqrt(dx*dx + dy*dy) < playerRadius) {
            playerHealth -= calculate_falloff_linear(5, 15, 0, 100, 50);
            if (playerHealth < 0) {
                playerHealth = 0
                currentGameState = GameState.GAME_LOST;

                if (textElement) {
                    textElement.innerText = "Ship Destroyed!";
                }
                break;
            }
        }
    }
}

// --- RENDER ---
function render() {
    if (currentGameState === GameState.GAME_LOST) {
        gl.clearColor(1.0, 0.8, 0.8, 1.0);
    }
    else if (currentGameState === GameState.GAME_WON) {
        gl.clearColor(0.8, 1.0, 0.8, 1.0);
    }
    else {
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);



    let turretColour = rgbNormal(92, 157, 195);
    
    if (isAimingAtShip) {
        turretColour = rgbNormal(255, 0, 0);
    }

    for (let i=0; i < activeLasers.length; i++) {
        drawLaser(activeLasers[i]);
    }

    for (let i=0; i < asteroids.length; i++) {
        drawAsteroid(asteroids[i].x, asteroids[i].y, asteroids[i].radius);
    }

    for (let i=0; i<turretsPos.length; i++) {
        drawGunTurret(turretsPos[i].x, turretsPos[i].y, aimAngles[i], turretColour);
    }

    drawPlayer(playerPos);
}

// main loop
function gameLoop(timestamp) {
    processInput(timestamp);
    update(timestamp);
    render();
    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// execute
init();
requestAnimationFrame(gameLoop);