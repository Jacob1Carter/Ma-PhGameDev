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

  /* // Vector testing
  // Points
  const a = [3, 0, 4];
  const b = [1, 2, 3];

  const aPlusB = addVector(a, b);
  const aMinusB = subtractVector(a, b);

  const bMinusA = subtractVector(b, a);

  const aScaled = scaleVector(a, 2);
  const bScaled = scaleVector(b, 1/3);
    
  // Print text
  textElement.innerText += '\Points\n-------\n';
  textElement.innerText += "a = " + printVector(a) + " (Pink)\n";
  textElement.innerText += "b = " + printVector(b) + " (Yellow)\n";

  // print text for added and subtracted vectors
  textElement.innerText += '\nArithmetic operations on vectors\n--------------------------------\n';
  textElement.innerText += "a+b = " + printVector(aPlusB) + " (Green)\n";
  textElement.innerText += "a-b = " + printVector(aMinusB) + " (Red)\n";
  textElement.innerText += "b-a = " + printVector(bMinusA) + " (White)\n";
  textElement.innerText += "2a = " + aScaled + "\n";
  textElement.innerText += "b/3 = " + bScaled + "\n";

  // Draw points
  drawVector(a, [1.0, 0.0, 1.0, 1.0], positionLocation, colourLocation);
  drawVector(b, [1.0, 1.0, 0.0, 1.0], positionLocation, colourLocation);

  drawVector(aPlusB, [0.0, 1.0, 0.0, 1.0], positionLocation, colourLocation);
  drawVector(aMinusB, [1.0, 0.0, 0.0, 1.0], positionLocation, colourLocation);
  drawVector(bMinusA, [1.0, 1.0, 1.0, 1.0], positionLocation, colourLocation);
  drawVector(aScaled, [1.0, 0.0, 1.0, 1.0], positionLocation, colourLocation);
  drawVector(bScaled, [1.0, 1.0, 0.0, 1.0], positionLocation, colourLocation);
  */

  // Vectors
  const a = [3, 0, 4];
  const b = [1, 2, 3];

  const aHat = normaliseVector(a);
  const bHat = normaliseVector(b);

  const aLen = getVectorLength(a);
  const bLen = getVectorLength(b);
  
  // Print text
  textElement.innerText += 'Vectors\n-------\n';
  textElement.innerText += "a = " + printVector(a) + "\n";
  textElement.innerText += "b = " + printVector(b) + "\n";

  // Vector magnitude and normalization
  textElement.innerText += '\nVector magnitude and normalization\n----------------------------------\n';
  textElement.innerText += "getVectorLength(a) = " + aLen + "\n";
  textElement.innerText += "getVectorLength(b) = " + bLen + "\n";

  //print normalised vectors
  textElement.innerText += "aHat = " + printVector(aHat) + "\n";
  textElement.innerText += "bHat = " + printVector(bHat) + "\n";

  //print length of normalised vectors
  textElement.innerText += "getVectorLength(aHat) = " + getVectorLength(aHat) + "\n";
  textElement.innerText += "getVectorLength(bHat) = " + getVectorLength(bHat) + "\n";

  // Draw vectors
  drawVector(a, [1.0, 0.0, 1.0, 1.0], positionLocation, colourLocation);
  drawVector(b, [1.0, 1.0, 0.0, 1.0], positionLocation, colourLocation);

  //draw normalised vectors
  drawVector(aHat, [1.0, 0.0, 1.0, 1.0], positionLocation, colourLocation);
  drawVector(bHat, [1.0, 1.0, 0.0, 1.0], positionLocation, colourLocation);
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