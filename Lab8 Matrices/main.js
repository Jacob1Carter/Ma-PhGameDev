function setupConsoleOutput(elementId) {
  const output = document.getElementById(elementId); 

  function write(args) {
    const line = document.createElement("div");
    line.textContent = [...args].join(" ");
    output.appendChild(line);
  }
  console.log = (...args) => write(args);
}

setupConsoleOutput("console-output");
console.log("Lab 8 - Matrices \n----------------------------");

const A = new Mat4().set([
    1,  2,  3,  4,
    5,  6,  7,  8,
    9, 10, 11, 12,
    13, 14, 15, 16
]);
console.log("\nA =\n" + A);

const AT = new Mat4().copy(A);
console.log("\nA^T =\n" + AT.transpose());

const A3 = new Mat4().copy(A);
console.log("\nA3 =\n" + A3.multScalar(3));

const B = new Mat4().set([
    17, 18, 19, 20,
    21, 22, 23, 24,
    25, 26, 27, 28,
    29, 30, 31, 32
])
console.log("\nB =\n" + B);

const AB = new Mat4().copy(A).multiply(B);
console.log("\nAB =\n" + AB);

const BA = new Mat4().copy(B).multiply(A);
console.log("\nBA =\n" + BA);

const C = new Mat4().set([
  1, 3, 2, 1,
  1, 1, 2, 2,
  1, 3, 3, 2,
  3, 1, 3, 2
]);
console.log("\nC =\n" + C);

const invC = new Mat4().copy(C).inverse();
console.log("\ninv(C) =\n" + invC);

console.log("\ninv(C)C =\n" + invC.multiply(C));