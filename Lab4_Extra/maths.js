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

function sinWavePoint(x, a, w, k, t, ps) {
    // x = x coordinate
    // a = amplitude
    // w = angular frequesncy
    // k = wave number
    // t = time
    // ps = phase shift
    y = a * Math.sin((k*x) - (w*t) + ps);
    return y
}

function sinWave(startx, endx, a, w, k, t, ps) {
    let sinWaveList = new Float32Array()
    for (let x = startx; x < endx; x++) {
        y = sinWavePoint(x, a, w, k, t, ps)
        // sinWaveList + (x, y, 0)
        console.log(x, y);
    }
}