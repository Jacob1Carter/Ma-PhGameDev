
const canvas = document.getElementById('gameCanvas');
const textElement = document.getElementById("textDisplay");
const scoreElement = document.getElementById("scoreDisplay");

/** @type {WebGL2RenderingContext} */
const gl = initWebGL(canvas);

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
const scaleLocation = gl.getUniformLocation(shaderProgram, "uScale");

// score

let score = 0

// turret
const turretPos = { x:0.0, y:-0.8 };
let aimAngle = Math.PI / 2; // radians
const rotationSpeed = 0.04;
let isAimingAtShip = false;

// player
const playerPos = { x: 0.0, y: 0.2, z: 0.0};
const playerSpeed = 0.015;
const playerSize = 0.15;
const playerRadius = 0.04;

const playerVertices = [
    0.0, 0.5,
    -0.4, -0.5,
    0.0, 0.2,
    0.4, -0.5
];

const playerIndices = [
    0, 1, 2,
    0, 2, 3
];

const playerMesh = createMesh(gl, playerVertices, playerIndices, positionAttribute)

// inputs
const keys = {ArrowLeft: false, ArrowRight: false, Space: false};

// projectiles
let activeLasers = [];
const laserSpeed = 0.03;
const fireCooldown = 150;
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
        const loseContextExt = gl.getExtension("WEBGL_lose_context");
        if (loseContextExt) {
            loseContextExt.loseContext();
        }
        //window.location.replace("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwtY94wcx-ZsbIWs8bI7hOEHbJCfZdFsRGdrVGiV_X9K5_wLEeONcZ1fqj&s=10");
    }
    else if (score >= 10) {
        const loseContextExt = gl.getExtension("WEBGL_lose_context");
        if (loseContextExt) {
            loseContextExt.loseContext();
        }
        //window.location.replace("https://images.photowall.com/products/60498/smiley-face.jpg?h=699&q=85");
    }

    isAimingAtShip = false;

    // turret direction vector
    const turretDirVector = {x:Math.cos(aimAngle), y:Math.sin(aimAngle)};
/*
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
    }*/

    for (let i=0; i < activeLasers.length; i++) {
        const laser = activeLasers[i];
        laser.x += laser.vx;
        laser.y += laser.vy;

        if (laser.y > 1.1 || laser.x > 1.1 || laser.x < -1.1 || laser.y < -1.1) {
            activeLasers.splice(i, 1);
            continue;
        }

        /*
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
            */
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

    drawPlayer(playerPos);
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