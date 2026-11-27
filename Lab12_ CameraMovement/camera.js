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

        this.moveSpeed = 5;
        this.yawTurnSpeed = 0.002
        this.pitchTurnSpeed = 0.0013;
        this.yaw = 0;
        this.pitch = 0;
    }

    update() {
        this.right = normaliseVector(getCrossProduct(this.front, this.worldUp));
        this.up = normaliseVector(getCrossProduct(this.right, this.front));

        const cy = Math.cos(this.yaw);
        const cospitch = Math.cos(this.pitch);
        const sy = Math.sin(this.yaw);
        const sp = Math.sin(this.pitch);

        this.front = normaliseVector([cospitch * sy, sp, -cospitch * cy]);
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

    move(forward, right, dt) {
        let moveDir = [0, 0, 0];
        if (forward > 0) moveDir = subtractVectors(moveDir, this.front);
        if (forward < 0) moveDir = addVectors(moveDir, this.front);
        if (right > 0) moveDir = addVectors(moveDir, this.right);
        if (right < 0) moveDir = subtractVectors(moveDir, this.right);
        
        moveDir = normaliseVector(moveDir);

        this.eye = addVectors(this.eye, scaleVector(moveDir, this.moveSpeed * dt));
    }

    rotate(dx, dy) {
        this.yaw += dx * this.yawTurnSpeed;
        this.pitch -= dy * this.pitchTurnSpeed;

        const pitchLimit = 80*Math.PI/180;
        this.pitch = Math.max(-pitchLimit, Math.min(pitchLimit, this.pitch));
    }
}