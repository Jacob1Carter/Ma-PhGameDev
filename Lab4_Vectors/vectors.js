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

  // Print text
  textElement.innerText += '\nResults\n-------\n';

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

  // Points
  const a = [3, 0, 4];
  const b = [1, 2, 3];
    
  // Print text
  textElement.innerText += '\Points\n-------\n';
  textElement.innerText += "a = " + printVector(a) + "\n";
  textElement.innerText += "b = " + printVector(b) + "\n";

  // Draw points
  drawVector(a, [1.0, 0.0, 1.0, 1.0], positionLocation, colourLocation);
  drawVector(b, [1.0, 1.0, 0.0, 1.0], positionLocation, colourLocation);
}

function printVector(v) {
    return `[ ${v[0].toFixed(2)}, ${v[1].toFixed(2)}, ${v[2].toFixed(2)} ]`;
}
/*
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
  */

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