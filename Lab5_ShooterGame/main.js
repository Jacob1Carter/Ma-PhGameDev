
const canvas = document.getElementById('gameCanvas');
const textElement = document.getElementById("textDisplay");

/** @type {WebGL2RenderingContext} */
const gl = initWebGL(canvas);

// turret
const turretPos = { x:0.0, y:-0.8 };
let aimAngle = Math.PI / 2; // radians
const rotationSpeed = 0.04;

// inputs
const keys = {ArrowLeft: false, ArrowRight: false};

// --- SHADER SETUP ---
const vertexShaderSource = `#version 300 es
    precision mediump float;

    in vec3 aPosition;
    uniform vec3 uTranslation;

    void main() {
            gl_Position = vec4(aPosition + uTranslation, 1.0);
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
function bindStateAndUniforms(buffer, colour, x, y) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(colourLocation, colour);

    gl.uniform3f(translationLocation, x, y, 0.0);
}

// draw
function drawGunTurret(x, y, colour) {
    bindStateAndUniforms(turretBuffer, colour, x, y);
    gl.drawArrays(gl.LINE_LOOP, 0, turretSegments + 1);
    gl.drawArrays(gl.LINES, turretSegments + 1, 2);
}

// input
function processInput() {
    if (!textElement) {
        console.log("textElement not found");
        return;
    }

    if (keys.ArrowLeft && keys.ArrowRight) {
        textElement.innerText = "Both arrows pressed";
    }
    else if (keys.ArrowLeft) {
        aimAngle += rotationSpeed;
        textElement.innerText = "Left arrow pressed";
    }
    else if (keys.ArrowRight) {
        aimAngle -= rotationSpeed;
        textElement.innerText = "Right arrow pressed";
    }
    else {
        textElement.innerText = "Nothing pressed";
    }
}

// update
function update() {

}

// --- RENDER ---
function render() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT);

    const turretColour = [0.0, 0.584, 0.867, 1.0];
    drawGunTurret(turretPos.x, turretPos.y, turretColour);
}

// main loop
function gameLoop() {
    processInput();
    update();
    render();
    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        keys[event.key] = true;
        event.preventDefault();
    }
});

window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        keys[event.key] = false;
        event.preventDefault();
    }
});

// execute
requestAnimationFrame(gameLoop);