
const canvas = document.getElementById('gameCanvas');
const textElement = document.getElementById("textDisplay");
const scoreElement = document.getElementById("scoreDisplay");

/** @type {WebGL2RenderingContext} */
const gl = initWebGL(canvas);

// playable boundary

let lastTimestamp = 0;

// --- SHADER SETUP ---
const vertexShaderSource = `#version 300 es
    precision mediump float;

    in vec3 aPosition;
    uniform vec3 uOffset;

    void main() {
        vec3 offset = aPosition + uOffset;
        gl_Position = vec4(offset, 1.0);
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
const offsetLocation = gl.getUniformLocation(shaderProgram, "uOffset");

const ball = {
    position: [0.0, 0.8, 0.0],
    velocity: [0.0, -0.6, 0.0],
    radius: 0.1,
    colour: [0.25, 0.4, 0.7, 1.0]
};

const ground = {
    position: [0.0, -0.9, 0.0],
    width: 2.0,
    height: 0.55,
    breadth: 0.0,
    colour: [0.0, 0.7, 0.2, 1.0],
    normal: [0.0, 1.0, 0.0]
}

function createBallGeometrey(radius, segments=32) {
    const verticies = [0, 0, 0]; // centre
    const indicies = [];

    for (let i=0; i<=segments; i++) {
        const angle = (i/segments) * Math.PI * 2;
        verticies.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
    }

    for (let i=1; i<=segments; i++) {
        indicies.push(0, i, i+1);
    }

    return createMesh(gl, verticies, indicies, positionAttribute);
}

function createGroundGeometery(g) {
    const halfW = g.width / 2;
    const halfH = g.height / 2;

    const verticies = [
        g.position[0] - halfW, g.position[1] + halfH, g.position[2],
        g.position[0] + halfW, g.position[1] + halfH, g.position[2],
        g.position[0] + halfW, g.position[1] - halfH, g.position[2],
        g.position[0] - halfW, g.position[1] - halfH, g.position[2],
    ]
    const indicies = [0, 1, 2, 0, 2, 3];

    return createMesh(gl, verticies, indicies, positionAttribute);
}

const ballMesh = createBallGeometrey(ball.radius);
const groundMesh = createGroundGeometery(ground);

function drawMesh(mesh, colour, offset = [0, 0, 0]) {
    gl.uniform4fv(colourLocation, colour);
    gl.uniform3fv(offsetLocation, offset);

    gl.bindVertexArray(mesh.vao);
    gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
}


function reflectVelocity(entity, normal, restitution=0.7) {
    const dotProduct = getDotProduct(entity.velocity, normal, true);

    if (dotProduct < 0) {
        const reflection = scaleVector(normal, (1+restitution)*dotProduct);
        entity.velocity = subtractVectors(entity.velocity, reflection);
    }
}

const gravity = 1.0;

// input
function processInput(deltaTime) {
}

// update
function update(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000
    lastTimestamp = timestamp;

    ball.velocity[1] -= gravity * dt;

    ball.position = addVectors(ball.position, scaleVector(ball.velocity, dt));

    const groundTop = ground.position[1] + (ground.height / 2);
    const distToGround = ball.position[1] - groundTop;
    if (distToGround <= ball.radius) {
        const penetration = ball.radius - distToGround;
        ball.position[1] += penetration;
        reflectVelocity(ball, ground.normal);
    }

}

// --- RENDER ---
function render() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawMesh(groundMesh, ground.colour);
    drawMesh(ballMesh, ball.colour, ball.position);
}

// main loop
function gameLoop(timestamp) {
    processInput(timestamp);
    update(timestamp);
    render();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);