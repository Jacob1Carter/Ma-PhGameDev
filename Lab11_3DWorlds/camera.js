class Camera {
    constructor() {
        this.eye = [0, 0, 0];
        this.worldUp = [0, 1, 0];
        this.front = [0, 0, -1];
        this.right = [1, 0, 0];
        this.up = [0, 1, 0];

        this.fov = 60*Math.PI / 180;
        this.aspect = 800/600;
        this.near = 0.1;
        this.far = 1000;
    }

    update() {
        this.right = normaliseVector(getCrossProduct(this.front, this.worldUp));
        this.up = normaliseVector(getCrossProduct(this.right, this.front));
    }

    getViewMatrix() {
        return new Mat4().set([
            this.right[0], this.up[0], -this.front[0], 0,
            this.right[1], this.up[1], -this.front[1], 0,
            this.right[2], this.up[2], -this.front[2], 0,
            -getDotProduct(this.eye, this.right),
            -getDotProduct(this.eye, this.up),
            getDotProduct(this.eye, this.front),
            1
        ])
    }

    getOrthographicMatrix(left, right, bottom, top, near, far) {
        const rl = 1 / (right - left);
        const tb = 1 / (top - bottom);
        const fn = 1 / (far - near);

        return new Mat4().set([
            2*rl, 0, 0, 0,
            0, 2*tb, 0, 0,
            0, 0, -2*fn, 0,
            -(right+left)*rl,
            -(top+bottom)*tb,
            -(far+near)*fn,
            1
        ]);
    }

    getPerspectiveMatrix() {
        const t = this.near * Math.tan(this.fov / 2);
        const r = this.aspect * t;
        const fn = 1 / (this.far - this.near);

        return new Mat4().set([
            this.near/r, 0, 0, 0,
            0, this.near/t, 0, 0,
            0, 0, -(this.far+this.near) * fn, -1,
            0, 0, -2*this.far*this.near*fn, 0
        ]);
    }
}