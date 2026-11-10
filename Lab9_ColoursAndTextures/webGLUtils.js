// Initialize WebGL context
function initWebGL(canvasId) {
	const canvas = document.getElementById(canvasId);
	if (!(canvas instanceof HTMLCanvasElement)) {
		throw new Error("Canvas element not found");
	}
	const gl = canvas.getContext('webgl2');
	if (!gl) {
		const gl = canvas.getContext('webgl')
		if (!gl) throw new Error("WebGL not supported");
	}

	if (!gl) throw new Error('WebGL not supported');
	
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.2, 0.2, 0.2, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	return gl;
}

// Compile a shader
function compileShader(gl, source, type) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

// Create shader program
function createProgram(gl, vertexSrc, fragmentSrc) {
	const vertexShader = compileShader(gl, vertexSrc, gl.VERTEX_SHADER);
	const fragmentShader = compileShader(gl, fragmentSrc, gl.FRAGMENT_SHADER);
	
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}
	return program;
}

// Create Mesh
function createMesh(gl, program, vertices, indices) {

	// Create VAO
	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	// Create VBO
	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	// Create EBO
	const ebo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	// Position attribute
	const stride = 6 * Float32Array.BYTES_PER_ELEMENT;
	const positionLocation = gl.getAttribLocation(program, "aPosition");
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, stride, 0);

	// Colour attribute
	let offset = 3 * Float32Array.BYTES_PER_ELEMENT;
	const colourLocation = gl.getAttribLocation(program, "aColour");
	gl.enableVertexAttribArray(colourLocation);
	gl.vertexAttribPointer(colourLocation, 3, gl.FLOAT, false, stride, offset);

	// Unbind VAO
	gl.bindVertexArray(null);

	return vao;
}

function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTxture(gl.TEXTURE_2D)

	// unfinished
}