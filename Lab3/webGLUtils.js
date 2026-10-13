// initialize WebGL context
function initWebGL(canvas) {
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL not supported");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return gl
}

// compile a shader
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(`Error compiling shader:\n`, gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    return shader
}

// create shader program
function createProgram(gl, vertexSource, fragmentSource) {
    // compile vertex shader
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
    // compile fragment shader
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(`Failed to link WebGL program : ${gl.geProgramInfoLog(program)}`);
        return;
    }

    return program
}