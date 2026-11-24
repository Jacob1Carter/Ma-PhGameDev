// Initialize WebGL context
function initWebGL(canvas) {
	const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
	if (!gl) throw new Error('WebGL not supported');

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.2, 0.2, 0.2, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.enable(gl.DEPTH_TEST);

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
	const stride = 8 * Float32Array.BYTES_PER_ELEMENT;
	const positionLocation = gl.getAttribLocation(program, "aPosition");
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, stride, 0);

	// Colour attribute
	let offset = 3 * Float32Array.BYTES_PER_ELEMENT;
	const colourLocation = gl.getAttribLocation(program, "aColour");
	gl.enableVertexAttribArray(colourLocation);
	gl.vertexAttribPointer(colourLocation, 3, gl.FLOAT, false, stride, offset);

	// Texture coordinates
	offset = 6 * Float32Array.BYTES_PER_ELEMENT;
	const texCoordsLocation = gl.getAttribLocation(program, "aTexCoords");
	gl.enableVertexAttribArray(texCoordsLocation);
	gl.vertexAttribPointer(texCoordsLocation, 2, gl.FLOAT, false, stride, offset);

	// Unbind VAO
	gl.bindVertexArray(null);

	return vao;
}

function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Temporary 1×1 pixel while image loads
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));

	const image = new Image();
	image.src = url;
	image.onload = () => {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);  

		// Auto-generate mipmaps (requires power-of-2 image)
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		} else {
		// Non-POT textures must be clamped & non-mipmapped
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	};

	return texture;
}

function isPowerOf2(x) {
	return (x & (x - 1)) === 0;
}

class Input {
	constructor(canvas) {
		this.keys = {};
		this.mouseDelta = {x: 0, y: 0};

		window.addEventListener("keydown", e => {
			this.keys[e.key.toLowerCase()] = true;
		});

		window.addEventListener("keyup", e => {
			this.keys[e.key.toLowerCase()] = false;
		});

		canvas.addEventListener("click", () => {
			canvas.requestPointerLock();
		});

		document.addEventListener("mousemove", e => {
			if (document.pointerLockElement === canvas) {
				this.mouseDelta.x += e.movementX;
				this.mouseDelta.y += e.movementY;
			}
		})
	}

	isDown(key) {
		return this.keys[key.toLowerCase()];
	}

	consumeMouseDelta() {
		const dx = this.mouseDelta.x;
		const dy = this.mouseDelta.y;

		this.mouseDelta.x = 0;
		this.mouseDelta.y = 0;

		return { dx, dy };
	}
}