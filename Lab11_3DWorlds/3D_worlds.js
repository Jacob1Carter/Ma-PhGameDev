// Define vertex shader
const vertexShader = 
`#version 300 es
precision mediump float;

in vec3 aPosition;
in vec3 aColour;
in vec2 aTexCoords;

out vec3 vColour;
out vec2 vTexCoords;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

void main() {
    gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);

    // Output vertex colour
    vColour = aColour;

    // Output texture coordinates
    vTexCoords = aTexCoords;
}`;

// Define fragment shader
const fragmentShader = 
`#version 300 es
precision mediump float;

in vec3 vColour;
in vec2 vTexCoords;

out vec4 fragColour;

uniform sampler2D uTexture;

void main() {
    fragColour = texture(uTexture, vTexCoords);
}`;


//Setup WebGL
const canvas = document.getElementById("canvasId");
const gl = initWebGL(canvas);

// Create WebGL program 
const program = createProgram(gl, vertexShader, fragmentShader);

// Set the shader program
gl.useProgram(program);

// Define cube vertices
const vertices = new Float32Array([
    // x  y  z     R  G  B     u  v                  + ------ +
    // front                                        /|       /|
    -1, -1,  1,    0, 0, 0,    0, 0, //   y        / |      / |
    1, -1,  1,    0, 0, 0,    1, 0, //   |       + ------ +  |
    1,  1,  1,    0, 0, 0,    1, 1, //   +-- x   |  + ----|- +
    -1, -1,  1,    0, 0, 0,    0, 0, //  /        | /      | /   
    1,  1,  1,    0, 0, 0,    1, 1, // z         |/       |/
    -1,  1,  1,    0, 0, 0,    0, 1, //           + ------ +   
    // right                        
    1, -1,  1,    0, 0, 0,    0, 0,
    1, -1, -1,    0, 0, 0,    1, 0, 
    1,  1, -1,    0, 0, 0,    1, 1,
    1, -1,  1,    0, 0, 0,    0, 0,
    1,  1, -1,    0, 0, 0,    1, 1,
    1,  1,  1,    0, 0, 0,    0, 1,
    // back
    1, -1, -1,    0, 0, 0,    0, 0,
    -1, -1, -1,    0, 0, 0,    1, 0,
    -1,  1, -1,    0, 0, 0,    1, 1,
    1, -1, -1,    0, 0, 0,    0, 0,
    -1,  1, -1,    0, 0, 0,    1, 1,
    1,  1, -1,    0, 0, 0,    0, 1,
    // left
    -1, -1, -1,    0, 0, 0,    0, 0,
    -1, -1,  1,    0, 0, 0,    1, 0,
    -1,  1,  1,    0, 0, 0,    1, 1,
    -1, -1, -1,    0, 0, 0,    0, 0,
    -1,  1,  1,    0, 0, 0,    1, 1,
    -1,  1, -1,    0, 0, 0,    0, 1,
    // bottom
    -1, -1, -1,    0, 0, 0,    0, 0,
    1, -1, -1,    0, 0, 0,    1, 0,
    1, -1,  1,    0, 0, 0,    1, 1,
    -1, -1, -1,    0, 0, 0,    0, 0,
    1, -1,  1,    0, 0, 0,    1, 1, 
    -1, -1,  1,    0, 0, 0,    0, 1,
    // top
    -1,  1,  1,    0, 0, 0,    0, 0,
    1,  1,  1,    0, 0, 0,    1, 0,
    1,  1, -1,    0, 0, 0,    1, 1,
    -1,  1,  1,    0, 0, 0,    0, 0,
    1,  1, -1,    0, 0, 0,    1, 1,
    -1,  1, -1,    0, 0, 0,    0, 1,
]);


// Define cube indices
const indices = new Uint16Array([
    0,  1,  2,  3,  4,  5,  // front
    6,  7,  8,  9, 10, 11,  // right
    12, 13, 14, 15, 16, 17,  // back
    18, 19, 20, 21, 22, 23,  // left
    24, 25, 26, 27, 28, 29,  // bottom
    30, 31, 32, 33, 34, 35   // top
]);

/*
// ? This arrangement of cubes does work:
const cubes = [
    { position : [-3, -1, -5] },
    { position : [0, 0, -15] }
];
*/

const cubes = [
    { position : [0, 0, -2] },
    { position : [0, 0, -6] }
];
const numCubes = cubes.length;

// Create Mesh
const cubeMesh = createMesh(gl, program, vertices, indices);

// Load texture
const texture = loadTexture(gl, "assets/crate.png");

// --- CORE LOOP FUNCTIONS ---
function processInput(timestamp) 
{

}

function update(timestamp)
{
    const target = [0, 0, -2];
    camera.eye = [1, 1, 1];
    camera.front = normaliseVector(subtractVectors(target, camera.eye));
    camera.update();
}

// camera

const camera = new Camera();

// Render function
function render(timestamp) {

    // Manual init call, no timing yet
    if (timestamp == null) {
        requestAnimationFrame(render);
        return;
    }

    // Clear frame buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the shader program
    gl.useProgram(program);

    // Calculate the view matrix
    const view = camera.getViewMatrix();

    //Calculate projecton matrix
    //const projection = camera.getOrthographicMatrix(-2, 2, -2, 2, 0, 100); // ? Same as the tutorial, but is broken
    //const projection = camera.getOrthographicMatrix(-2, 2, -2, 2, -0.6, 100); // ? Changing the near fixes it, but not sure why it wasn't working already
    const projection = camera.getPerspectiveMatrix();
    
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uView"), false, view.m);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uProjection"), false, projection.m);

    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, "uTexture"), 0);

    // Draw the cubes
    for (let i=0; i<numCubes; i++) {
        // Calculate the model matrix
        const rotationsPerSecond = 1/3
        const angle = rotationsPerSecond * timestamp * 2 * Math.PI * 0.001;
        const model = new Mat4()
            .translate(cubes[i].position)
            .rotate([0, 1, 0], angle)
            .scale([0.5, 0.5, 0.5]); 
        
        // Send the model matrix to the shaders
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModel"), false, model.m);

        gl.bindVertexArray(cubeMesh);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }
}

// --- MAIN LOOP ---
function gameLoop(timestamp) {
    processInput(timestamp);
    update(timestamp);
    render(timestamp);
    requestAnimationFrame(gameLoop);
}


// --- EXECUTION ---
requestAnimationFrame(gameLoop);