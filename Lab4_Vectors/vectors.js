// Setup WebGL
  const canvas = document.getElementById("canvas");

  /** @type {WebGL2RenderingContext} */
  const gl = initWebGL(canvas);
  gl.enable(gl.DEPTH_TEST);


// Define vertex shader
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

  // Find the memory addresses of the variables on the GPU
  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const colourLocation = gl.getUniformLocation(program, "uColour");

}

render();