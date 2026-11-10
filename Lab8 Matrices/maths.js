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
    const y = a * Math.sin((k*x) - (w*t) + ps);
    return y;
}

function sinWave(startx, endx, a, w, k, t, ps, inc) {
    // a = amplitude
    // w = angular frequesncy
    // k = wave number
    // t = time
    // ps = phase shift
    // inc = increment
    let sinWaveList = [];
    for (let x = startx; x <= endx; x+=inc) {
        const y = sinWavePoint(x, a, w, k, t, ps);
        sinWaveList.push([x, y, 0]);
    }
    return sinWaveList;
}

function rgbNormal(r, g, b) {
    const red = r/255;
    const green = g/255;
    const blue = b/255;
    const alpha = 1;

    return [red, green, blue, alpha];
}

function getDotProduct(a, b) {
    return (a.x * b.x) + (a.y * b.y);
}

function getCrossProduct(a, b) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}

function calculate_falloff_linear(min, max, near, far, dist) {
    const dist_normal = (dist - near) / (far - near);
    return dist_normal * min + (1.0 - dist_normal) * max // unfinished
}

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function randInt(min, max, inc=true) {
    if (inc) max++;
    return Math.floor(Math.random() * (max - min) + min);
}

class Mat4 {
    constructor() {
        this.m = new Float32Array(16);
        this.identity();
    }

    identity() {
        const m = this.m;
        m[0] = 1; m[4] = 0; m[8] = 0; m[12] = 0;
        m[1] = 0; m[5] = 1; m[9] = 0; m[13] = 0;
        m[2] = 0; m[6] = 0; m[10] = 1; m[14] = 0;
        m[3] = 0; m[7] = 0; m[11] = 0; m[15] = 1;
        return this;
    }

    set(values) {
        this.m.set(values);
        return this;
    }

    toString() {
        const m = this.m;
        let string = "";
        for (let i=0; i<4; i++) {
            const row = [
                m[i*4+0].toFixed(2).padStart(8),
                m[i*4+1].toFixed(2).padStart(8),
                m[i*4+2].toFixed(2).padStart(8),
                m[i*4+3].toFixed(2).padStart(8)
            ];
            string += "[" + row.join("") + " ]\n";
        }
        return string;
    }

    copy(mat) {
        this.m.set(mat.m);
        return this;
    }

    transpose() {
        const m = this.m;
        let tmp;
        tmp = m[1]; m[1] = m[4]; m[4] = tmp;
        tmp = m[2]; m[2] = m[8]; m[8] = tmp;
        tmp = m[3]; m[3] = m[12]; m[12] = tmp;
        tmp = m[6]; m[6] = m[9]; m[9] = tmp;
        tmp = m[7]; m[7] = m[13]; m[13] = tmp;
        tmp = m[11]; m[11] = m[14]; m[14] = tmp;
        return this
    }

    multScalar(scalar) {
        const m = this.m;
        for (let i=0; i<m.length; i++) {
            m[i] *= scalar;
        }
        return this;
    }

    multiply(mat) {
        const result = new Float32Array(16);
        for (let col=0; col<4; col++) {
            for (let row=0; row<4; row++) {
                let sum = 0;
                for (let k=0; k<4; k++) {
                    sum += this.m[row+k*4] * mat.m[k+col*4];
                }
                result[row+col*4] = sum;
            }
        }
        this.set(result);
        return this;
    }

    inverse() {
        let m = this.m;
        const inv = new Float32Array([
            m[5] * m[10] * m[15] - m[5]  * m[11] * m[14] - m[9]  * m[6] * m[15] +
            m[9] * m[7]  * m[14] + m[13] * m[6]  * m[11] - m[13] * m[7] * m[10],
            -m[1] * m[10] * m[15] + m[1]  * m[11] * m[14] + m[9]  * m[2] * m[15] -
            m[9] * m[3]  * m[14] - m[13] * m[2]  * m[11] + m[13] * m[3] * m[10],
            m[1] * m[6]  * m[15] - m[1]  * m[7]  * m[14] - m[5]  * m[2] * m[15] +
            m[5] * m[3]  * m[14] + m[13] * m[2]  * m[7]  - m[13] * m[3] * m[6],
            -m[1] * m[6]  * m[11] + m[1]  * m[7]  * m[10] + m[5]  * m[2] * m[11] -
            m[5] * m[3]  * m[10] - m[9]  * m[2]  * m[7]  + m[9]  * m[3] * m[6],

            -m[4] * m[10] * m[15] + m[4]  * m[11] * m[14] + m[8]  * m[6] * m[15] -
            m[8] * m[7]  * m[14] - m[12] * m[6]  * m[11] + m[12] * m[7] * m[10],
            m[0] * m[10] * m[15] - m[0]  * m[11] * m[14] - m[8]  * m[2] * m[15] +
            m[8] * m[3]  * m[14] + m[12] * m[2]  * m[11] - m[12] * m[3] * m[10],
            -m[0] * m[6]  * m[15] + m[0]  * m[7]  * m[14] + m[4]  * m[2] * m[15] -
            m[4] * m[3]  * m[14] - m[12] * m[2]  * m[7]  + m[12] * m[3] * m[6],
            m[0] * m[6]  * m[11] - m[0]  * m[7]  * m[10] - m[4]  * m[2] * m[11] +
            m[4] * m[3]  * m[10] + m[8]  * m[2]  * m[7]  - m[8]  * m[3] * m[6],

            m[4] * m[9] * m[15] - m[4]  * m[11] * m[13] - m[8]  * m[5] * m[15] +
            m[8] * m[7] * m[13] + m[12] * m[5]  * m[11] - m[12] * m[7] * m[9],
            -m[0] * m[9] * m[15] + m[0]  * m[11] * m[13] + m[8]  * m[1] * m[15] -
            m[8] * m[3] * m[13] - m[12] * m[1]  * m[11] + m[12] * m[3] * m[9],
            m[0] * m[5] * m[15] - m[0]  * m[7]  * m[13] - m[4]  * m[1] * m[15] +
            m[4] * m[3] * m[13] + m[12] * m[1]  * m[7]  - m[12] * m[3] * m[5],
            -m[0] * m[5] * m[11] + m[0]  * m[7]  * m[9]  + m[4]  * m[1] * m[11] -
            m[4] * m[3] * m[9]  - m[8]  * m[1]  * m[7]  + m[8]  * m[3] * m[5],

            -m[4] * m[9] * m[14] + m[4]  * m[10] * m[13] + m[8]  * m[5] * m[14] -
            m[8] * m[6] * m[13] - m[12] * m[5]  * m[10] + m[12] * m[6] * m[9],
            m[0] * m[9] * m[14] - m[0]  * m[10] * m[13] - m[8]  * m[1] * m[14] +
            m[8] * m[2] * m[13] + m[12] * m[1]  * m[10] - m[12] * m[2] * m[9],
            -m[0] * m[5] * m[14] + m[0]  * m[6]  * m[13] + m[4]  * m[1] * m[14] -
            m[4] * m[2] * m[13] - m[12] * m[1]  * m[6]  + m[12] * m[2] * m[5],
            m[0] * m[5] * m[10] - m[0]  * m[6]  * m[9]  - m[4]  * m[1] * m[10] +
            m[4] * m[2] * m[9]  + m[8]  * m[1]  * m[6]  - m[8]  * m[2] * m[5]
        ]);

        let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
        if (det === 0) {
            console.error("Matix is singular, no inverse exists");
            return null;
        }

        det = 1/det;
        for (let i=0; i<16; i++) {
            inv[i] *= det;
        }
        this.set(inv);
        return this;
    }
}