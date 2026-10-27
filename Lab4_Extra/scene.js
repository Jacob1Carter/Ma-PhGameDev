// Setup WebGL
const canvas = document.getElementById("canvas");

/** @type {WebGL2RenderingContext} */
const gl = initWebGL(canvas);
gl.enable(gl.DEPTH_TEST);


// Define vertex shader
const vertexShaderSource = 
`#version 300 es
precision mediump float;

uniform float uScale;
in vec3 aPosition;

void main() {
    gl_Position = vec4(aPosition/uScale, 1.0);
    gl_PointSize = 8.0;
}`;

// Define fragment shader
const fragmentShaderSource = 
`#version 300 es
precision mediump float;

uniform vec4 uColour;
out vec4 fragColour;

void main() {
    fragColour = uColour;
}`;

// render function
function render() {

    const textElement = document.getElementById('textDisplay');

    if (!textElement)
    {
        console.log("textElement not found");
        return;
    }

    // Create WebGL program 
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    // Set the shader program
    gl.useProgram(program);

    // Locate and set the new canvas scale uniform
    const scaleLocation = gl.getUniformLocation(program, "uScale");
    gl.uniform1f(scaleLocation, 10.0); // Sets the coordinate range from -10 to +10

    // Find the memory addresses of the variables on the GPU
    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const colourLocation = gl.getUniformLocation(program, "uColour");

    // SHAPES
    const bgData = new Float32Array([
        -10, -10, 1,
        10, -10, 1,
        -10,  10, 1,
        10, 10, 1,
    ]);

    const line = [3, 5, 0];

    const bgBuffer = createShapeBuffer(gl, bgData);

    //unbind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    //Draw
    setupDrawState(gl, bgBuffer, [0.6, 0.7, 0.9, 1.0], positionLocation, colourLocation);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 5);

    // drawVector(line, [1.0, 0.0, 1.0, 1.0], positionLocation, colourLocation);

    const sinWaveList = sinWave(-10, 10, 1, 1, 1, 0, 0, 1);

    for (let i = 0; i < sinWaveList.length; i++) {
        if (i > 0) {
            const prevPoint = sinWaveList[i - 1];
            const currentPoint = sinWaveList[i];
            const lineData = new Float32Array([
                prevPoint[0], prevPoint[1], prevPoint[2],
                currentPoint[0], currentPoint[1], currentPoint[2]
            ]);
            const segmentData = new Float32Array([
                prevPoint[0], prevPoint[1], prevPoint[2],
                currentPoint[0], currentPoint[1], currentPoint[2],
                currentPoint[0], -10, currentPoint[2],
                prevPoint[0], -10, prevPoint[2]
            ])

            const lineBuffer = createShapeBuffer(gl, lineData);
            const segmentBuffer = createShapeBuffer(gl, segmentData);

            setupDrawState(gl, lineBuffer, [0.6, 0.4, 0.3, 1.0], positionLocation, colourLocation);
            setupDrawState(gl, segmentBuffer, [0.6, 0.4, 0.3, 0.5], positionLocation, colourLocation);

            gl.drawArrays(gl.LINES, 0, 2);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
    }
}

function drawPoint(point, colour, positionLocation, colourLocation) {
    // define the line
    const pointData = new Float32Array(point);
    // alloate memory and move data to GPU
    const buffer = createShapeBuffer(gl, pointData);
    // configure drawing
    setupDrawState(gl, buffer, colour, positionLocation, colourLocation);
    // Draw the point
    gl.drawArrays(gl.POINTS, 0, 1);
    //clean
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function drawVector(vector, colour, positionLocaion, colourLocation) {
    // define the line
    const vectorData = new Float32Array(vector);
    // alloate memory and move data to GPU
    const buffer = createShapeBuffer(gl, vectorData);
    // configure drawing
    setupDrawState(gl, buffer, colour, positionLocaion, colourLocation);
    // Draw the line
    gl.drawArrays(gl.LINES, 0, 2);
    // draw point to represent the tip of the vector
    gl.drawArrays(gl.POINTS, 0, 1); // !? had to change the index from what the instructions said
    // clean
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

render();