// vertex shader        
const vertexShaderSource = 
`#version 300 es
precision mediump float;

in vec3 aPosition;

void main() {
    gl_Position = vec4(aPosition, 1.0);
}`;

// fragment shader
const fragmentShaderSource = 
`#version 300 es
precision mediump float;

out vec4 fragColor;

void main() {
    fragColor = vec4(1.0, 0.0, 0.0, 1.0);
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

    // webgl setup
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl2");
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
    const vertices = new Float32Array([
        -0.5, -0.5, 0.0,
         0.5, -0.5, 0.0,
         0.0,  0.5, 0.0
    ])

    // vertex buffer object
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
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

    // create webgl shader program
    const program = gl.createProgram();
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
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(
        positionLocation,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// run code
main()