// vertex shader        
const vertexShaderSource = 
`#version 300 es
precision mediump float;

in vec3 aPosition;

void main() {
    gl_Position = vec4(aPosition, 1.0);
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

/*
// class for all triangles
class Triangle {
    constructor(vertices) {
        this.vertices = vertices;

        // vertex buffer object
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // vertex shader        
        this.vertexShaderSource = 
        `#version 300 es
        precision mediump float;
        
        in vec3 aPosition;
        
        void main() {
            gl_Position = vec4(aPosition, 1.0);
        }`;

        // compile
        this.vertexShaer = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShader, this.vertexShaderSource);
        gl.compileShader(this.vertexShader);

        if (!gl.getShaderPeramater(this.vertexShader, gl.COMPILE_STATUS)) {
            console.log(`Error compiling vertex shader:\n`, gl.getShaderInfoLog(this.vertexShader));
            gl.deleteShader(this.vertexShader);
        }

        // fragment shader
        this.fragentShaderSource = 
        `#version 300 es
        precision mediump float;
        
        out vec4 fragColor;
        
        void main() {
            fragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }`;

        // compile
        this.fragmentShaer = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShader, this.fragmentShaderSource);
        gl.compileShader(this.fragmentShader);

        if (!gl.getShaderPeramater(this.fragmentShader, gl.COMPILE_STATUS)) {
            console.log(`Error compiling fragment shader:\n`, gl.getShaderInfoLog(this.fragmentShader));
            gl.deleteShader(this.fragmentShader);
        }
    }
}*/

// main func
function main() {

    // Setup WebGL
    const canvas = document.getElementById("canvas");
    const gl = initWebGL(canvas);
    if (!gl) throw new Error("WebGL not supported");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
/*
    // create properties for triangles
    vertices1 = new Float32Array([
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        0, 0.5, 0
    ])

    vertices2 = new Float32Array([
        -1, -2, 0,
        1, -2, 0,
        0, 1, 0
    ])

    // create triangle objects
    const triangle1 = new Triangle(vertices1)
    const triangle2 = new Triangle(vertices2)
*/
    // Define square vertices
    const houseData = new Float32Array([
        // x    y    z
        -0.5, -0.5, 0.0, // vertex 0
        0.5, -0.5, 0.0, // vertex 1
        -0.5,  0.5, 0.0, // vertex 2
        0.5, 0.5,  0.0, // vertex 3
        0.0, 1.0, 0.0 // vertex 4
    ]);

    //Define door vertices
    const doorData = new Float32Array([
        0.0, -0.5, -0.1,
        0.3, -0.5, -0.1,
        0.0, -0.1, -0.1,
        0.3, -0.1, -0.1
    ]);

    //Define window vertices
    const windowData = new Float32Array([
        -0.4, 0.4, -0.1,
        -0.1, 0.4, -0.1,
        -0.4, 0.2, -0.1,
        -0.1, 0.2, -0.1
    ]);

    //Define grass vertices
    const grassData = new Float32Array([
        -1.0, -1.0, 0.1,
        1.0, -1.0, 0.1,
        -0.5, -0.5, 0.1,
        0.5, -0.5, 0.1
    ]);

    // Define roofLine (Z = -0.1, in front of house)
    const roofLineData = new Float32Array([
        -0.5, 0.5, -0.1,
        0.5, 0.5, -0.1
    ]);

    // Define Sun
    const segments = 15;
    const width = 0.2;
    const length = 0.2;
    const cx = -0.75; // Offset X
    const cy = 0.7; // Offset Y

    // Apply offset to centre vertex
    const sunArray = [cx, cy, 0.0]; 

    for (let i = 0; i <= segments; i++) {
        const angleCircle = (i * 2 * Math.PI) / segments;
        sunArray.push(
            cx + (width * Math.cos(angleCircle)), // Apply offset to perimeter X
            cy + (length * Math.sin(angleCircle)), // Apply offset to perimeter Y
            0.0 
        );
    }

    const sunData = new Float32Array(sunArray);

    // vertex buffer object
    // Allocate GPU memory and upload data
    const houseBuffer = createShapeBuffer(gl, houseData);
    const doorBuffer = createShapeBuffer(gl, doorData);
    const windowBuffer = createShapeBuffer(gl, windowData);
    const grassBuffer = createShapeBuffer(gl, grassData);
    const roofLineBuffer = createShapeBuffer(gl, roofLineData);
    // Allocate GPU memory and upload data
    const sunBuffer = createShapeBuffer(gl, sunData);

    //unbind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // compile vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log(`Error compiling vertex shader:\n`, gl.getShaderInfoLog(vertexShader));
        gl.deleteShader(vertexShader);
    }

    // compile fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log(`Error compiling fragment shader:\n`, gl.getShaderInfoLog(fragmentShader));
        gl.deleteShader(fragmentShader);
    }

    // Create WebGL program 
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(`Failed to link WebGL program : ${gl.geProgramInfoLog(program)}`);
        return;
    }

    // set shader
    gl.useProgram(program)

    // tell webgl how to read data from buffer
    const positionLocation = gl.getAttribLocation(program, "aPosition");

    //get uColour location from GPU memory
    const colourLocation = gl.getUniformLocation(program, 'uColour');

    //Draw a house
    setupDrawState(gl, houseBuffer, [1.0, 1.0, 0.0, 1.0], positionLocation, colourLocation);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 5);

    //Draw door
    setupDrawState(gl, doorBuffer, [0.0, 0.0, 1.0, 1.0], positionLocation, colourLocation);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    //Draw window
    setupDrawState(gl, windowBuffer, [1.0, 0.0, 0.5, 1.0], positionLocation, colourLocation);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    //Draw grass
    setupDrawState(gl, grassBuffer, [0.0, 1.0, 0.0, 1.0], positionLocation, colourLocation);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    //Draw roofLine
    setupDrawState(gl, roofLineBuffer, [0.6, 0.4, 0.3, 1.0], positionLocation, colourLocation);
    gl.drawArrays(gl.LINES, 0, 2);

    //Draw Sun
    setupDrawState(gl, sunBuffer, [1.0, 0.5, 0.0, 1.0], positionLocation, colourLocation);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, segments+2);
}

//init shape
function createShapeBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
}

//render shape
function setupDrawState(gl, buffer, colour, positionLocation, colourLocation) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    // Tell WebGL how to read data from the vertex buffer
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    //send colour data to fragment shader
    gl.uniform4fv(colourLocation, colour);
}

// run code
main()