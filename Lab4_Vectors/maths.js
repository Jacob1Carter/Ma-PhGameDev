function addVector(a, b) {
  return [ a[0] + b[0], a[1] + b[1], a[2] + b[2] ];
}

function subtractVector(a, b) {
  return [ a[0] - b[0], a[1] - b[1], a[2] - b[2] ];
}

function scaleVector(v, k) {
  return [ k * v[0], k * v[1], k * v[2] ];
}

function getVectorLength(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function normaliseVector(v) {
  const len = getVectorLength(v);
  if (len === 0) return [0, 0, 0];
  return scaleVector(v, 1 / len);
}