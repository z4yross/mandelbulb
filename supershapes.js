const detT = 100;
const detF = 100;

let shape = [];

let easycam;

function setup() {
    createCanvas(900, 900, WEBGL);
    easycam = createEasyCam();
    // easycam = new Dw.EasyCam(this._renderer);

    Dw.EasyCam.prototype.apply = function (n) {
        var o = this.cam;
        n = n || o.renderer,
            n && (this.camEYE = this.getPosition(this.camEYE), this.camLAT = this.getCenter(this.camLAT), this.camRUP = this.getUpVector(this.camRUP), n._curCamera.camera(this.camEYE[0], this.camEYE[1], this.camEYE[2], this.camLAT[0], this.camLAT[1], this.camLAT[2], this.camRUP[0], this.camRUP[1], this.camRUP[2]))
    };

    superformula(20.0, 20.0, 3.0, 2.0, 5.0, 7.0);
}

function draw() {
    background(0);
    drawShape();
}

function superformula(a, b, m, n1, n2, n3) {
    for (let i = 0; i < detT; i++) {
        for (let j = 0; j < detF; j++) {
            const t = map(i, 0, detT, -PI, PI);
            const f = map(j, 0, detF, -PI / 2, PI / 2);

            const r1Aux = pow(abs(abs(cos(m * t / 4.0)) / a), n2) + pow(abs(abs(sin(m * t / 4.0)) / b), n3);
            const r1 = pow(abs(r1Aux), -1.0 / n1);

            const r2Aux = pow(abs(abs(cos(m * f / 4.0)) / a), n2) + pow(abs(abs(sin(m * f / 4.0)) / b), n3);
            const r2 = pow(abs(r2Aux), -1.0 / n1);

            const x = r1 * cos(t) * r2 * cos(f);
            const y = r1 * sin(t) * r2 * cos(f);
            const z = r2 * sin(f);

            shape.push(createVector(x, y, z))
        }
    }
}

function drawShape() {
    push();

    stroke(255);
    strokeWeight(2);

    shape.forEach(p => {
        point(p.x, p.y, p.z)
    });

    pop();
}