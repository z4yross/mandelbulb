// const C = Complex;

const detX = 100;
const detY = 100;
const detZ = 100;

const detT = 50;
const detF = 50;

const LIMIT = 2;
const ITERATIONS = 10;

let N = 3;

let shape = [];

let mandelbulbShader;
let pg;

let easycam;

let cube;

let deltaN = 0.05;



function preload() {
    mandelbulbShader = readShader('./mandelbulb.frag', { precision: Tree.highp, matrices: Tree.NONE, varyings: [Tree.position2 | Tree.texcoords2] });
    // mandelbulbShader = loadShader('./mandelbulb.vert', './mandelbulb.frag');

    // cube = loadModel('./cube.obj', true)
}

function setup() {
    createCanvas(parent.innerWidth, parent.innerWidth, WEBGL);
    // createCanvas(200, 200, WEBGL);

    // let state = {
    //     distance: 2,           // scalar
    //     center: [0., 0., 0.],       // vector
    //     rotation: [0., 1., 0., 1.],  // quaternion
    // };
    easycam = createEasyCam({ distance: 2 });
    // easycam.setState(state);

    textureMode(NORMAL);

    noStroke();

    // shader(mandelbulbShader);
    // mandelbulbShader.setUniform('LIMIT', LIMIT);
    // mandelbulbShader.setUniform('N', N);

    // pg = createGraphics(parent.window.innerWidth, parent.window.innerHeight, WEBGL);
    // textureMode(NORMAL);


    // pg.noStroke();
    // pg.textureMode(NORMAL);
    // // // use truchetShader to render onto pg
    // pg.shader(mandelbulbShader);
    // // // emitResolution, see:
    // // // https://github.com/VisualComputing/p5.treegl#macros
    // pg.emitResolution(mandelbulbShader);
    // // https://p5js.org/reference/#/p5.Shader/setUniform
    // mandelbulbShader.setUniform('width', pg.width);
    // mandelbulbShader.setUniform('height', pg.height);
    // // pg clip-space quad (i.e., both x and y vertex coordinates ∈ [-1..1])
    // pg.quad(-1, -1, 1, -1, 1, 1, -1, 1);
    // // // set pg as texture
    // // texture(pg);

    // image(pg, -width/2, -height/2)





    // const pr1 = {a: 1, b: 1, k: 2, l: 44, n1: -0.2, n2: 1, n3: 1}
    // const pr1 = {a: 1, b: 1, k: 88, l: 64, n1: -20, n2: -20, n3: -20}
    // const pr2 = {a: 1, b: 1, k: 2, l: 44, n1: 2, n2: 2, n3: 2}
    // const pr2 = {a: 1, b: 1, k: 2, l: 2, n1: 2, n2: 2, n3: 2}

    // const pr1 = { a: 1, b: 1, k: 2, l: 2, n1: 2, n2: 2, n3: 2 }
    // const pr2 = { a: 1, b: 1, k: 2, l: 2, n1: 2, n2: 2, n3: 2 }
    
    // superformula(pr1, pr2, 200);

    // superformula(1, 1, 3, 3, 2, 5, 7, 200);

    // console.log(nylander(1, 1, 1, 3));

    // mandelbulb();
    // console.log(shape[0][0]);
    // quad(-1, -1, 1, -1, 1, 1, -1, 1);
    // drawShader();

}

function draw() {
    background(0);
    // orbitControl();
    fill(255);

    // noStroke();

    // sphere(200);
    // drawShape();
    // mandelbulb();

    // mandelbulbShader.setUniform('r', 1.5 * exp(-6.5 * (1 + sin(millis() / 2000))));
    // quad(-width/2, -height/2, width/2, -height/2, width/2, height/2, -width/2, height/2);


    quad(-1, -1, 1, -1, 1, 1, -1, 1);

    // sphere(200);
    // model(cube);

    // console.log(frameCount)

    // console.log(pMatrix());
    drawShader();
    // drawShader();
    // fill(255)
    // console.log(mMatrix().mat4);
    // sphere(200);

    N += deltaN;
    if (N < 3 || N >= 24)
        deltaN *= -1;
    // N =  N <= 3. ? deltaN : N;


}

function drawShader() {
    push();


    shader(mandelbulbShader);
    mandelbulbShader.setUniform('LIMIT', LIMIT);
    mandelbulbShader.setUniform('N', N);

    mandelbulbShader.setUniform('WIDTH', width);
    mandelbulbShader.setUniform('HEIGHT', height);

    mandelbulbShader.setUniform('cameraRotation', easycam.getRotation());
    mandelbulbShader.setUniform('cameraCenter', easycam.getCenter());
    mandelbulbShader.setUniform('cameraDistance', easycam.getDistance());

    mandelbulbShader.setUniform('mMatrix', dMatrix().mat3);
    mandelbulbShader.setUniform('mouseX', mouseX)

    mandelbulbShader.setUniform('time', frameCount);
    // console.log(easycam.getRotation(), easycam.getCenter(), easycam.getDistance());
    // console.log(dMatrix().mat3);


    quad(-width / 2, -height / 2, width / 2, -height / 2, width / 2, height / 2, -width / 2, height / 2);
    // sphere(200);
    pop();
}

function superformula(pr1, pr2, r) {
    for (let i = 0; i <= detT; i++) {
        shape[i] = [];

        const t = map(i, 0, detT, -PI, PI);
        const rt = superformulaR(t, pr1.a, pr1.b, pr1.k, pr1.l, pr1.n1, pr1.n2, pr1.n3);

        for (let j = 0; j <= detF; j++) {
            const f = map(j, 0, detF, -HALF_PI, HALF_PI);
            const rf = superformulaR(f, pr2.a, pr2.b, pr2.k, pr2.l, pr2.n1, pr2.n2, pr2.n3);

            const x = rt * cos(t) * rf * cos(f);
            const y = rt * sin(t) * rf * cos(f);
            const z = rf * sin(f);

            shape[i].push(createVector(x * r, y * r, z * r))
        }
    }
}

function mandelbulb() {
    for (let i = 0; i <= detX; i++) {
        const x = map(i, 0, detX, -1, 1);
        // console.log(x)

        shape[i] = [];

        for (let j = 0; j <= detY; j++) {
            const y = map(j, 0, detY, -1, 1);

            let edge = false;
            for (let k = 0; k <= detZ; k++) {
                const z = map(k, 0, detZ, -1, 1);

                let v = createVector(x, y, z);
                let c;

                let isBounded = true;

                let l = 0;
                while (isBounded && l < ITERATIONS) {
                    const ny = nylander(v.x, v.y, v.z, N);

                    c = v.copy();
                    v = ny[0].add(c);

                    isBounded = ny[1] < LIMIT;

                    if (!isBounded)
                        edge = edge ? false : edge;


                    l++;
                }

                if (isBounded) {
                    if (!edge) {
                        edge = true;
                        shape[i].push(createVector(x * 100, y * 100, z * 100));
                    }
                }
            }
        }
    }
}

function nylander(x, y, z, n) {
    const r = sqrt(x * x + y * y + z * z);
    const f = atan2(y, x);
    const t = acos(z / r);

    const x1 = pow(r, n) * sin(t * n) * cos(f * n);
    const y1 = pow(r, n) * sin(t * n) * sin(f * n);
    const z1 = pow(r, n) * cos(t * n);

    return [createVector(x1, y1, z1), r];
}


function superformulaR(p, a, b, k, l, n1, n2, n3) {
    return pow(pow(abs((1 / a) * cos(k * p / 4.0)), n2) + pow(abs((1 / b) * sin(l * p / 4)), n3), -1.0 / n1);
}

function drawShape() {
    push();

    stroke(255, 255, 255, 0.1);
    strokeWeight(0.5);

    shape.forEach(l => {
        l.forEach(p => {
            point(p.x, p.y, p.z);
        })
    })

    // stroke(80);
    // strokeWeight(0.1);
    // noStroke();

    // let c = color(255);

    // colorMode(RGB, detT);

    // beginShape(TRIANGLE_STRIP );

    // for (let i = 0; i < detT; i++) {
    //     beginShape(TRIANGLE_STRIP);

    //     for (let j = 0; j < shape[i].length; j++) {
    //         if(!shape[i+1][j])
    //             continue

    //         const ji = map(j, 0, detF, 0, detT)

    //         fill(abs((i * 2) - detT), 0, detT - abs((ji * 2) - detT))

    //         // console.log(i, j);

    //         let v1 = shape[i][j];
    //         vertex(v1.x, v1.y, v1.z);


    //         let v2 = shape[i + 1][j];
    //         vertex(v2.x, v2.y, v2.z);
    //     }
    //     endShape();
    // }
    pop();
}


function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        if(isCapturing())  stopCapturing();
    } if(keyCode === RIGHT_ARROW){
        startCapturing();
    }
}
