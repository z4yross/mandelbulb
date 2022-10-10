precision highp float;
varying vec2 vPos;
uniform vec2 p;
uniform float r;
const int I = 500;

const int detX = 200;
const int detY = 200;
const int detZ = 200;

const int MAX_RAY_STEPS = 100;
const float MIN_MARCH_DISTANCE = 0.000000001;
const float MAX_MARCH_DISTANCE = 100.;

const int MAX_ITERATIONS = 10;

uniform float LIMIT;
uniform float N;

// varying vec3 position3;
varying vec2 position2;
varying vec2 texcoords2;

uniform float WIDTH;
uniform float HEIGHT;

uniform vec3 cameraCenter;
uniform vec4 cameraRotation;
uniform float cameraDistance;

uniform mat3 mMatrix;

uniform int time;

float map(float value, float istart, float istop, float ostart, float ostop) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

mat2 Rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat2(c, -s, s, c);
}

float mandelbulbVertex(vec3 pos) {
    vec3 p = pos;

    float r = 0.;
    float dr = 1.0;
    vec3 z = p;

    for(int l = 0; l < MAX_ITERATIONS; l++) {
        // r = length(rotate(z));
        r = length(z);

        if(r > float(LIMIT))
            break;

        float f = atan(z.y, z.x);
        float t = acos(z.z / r);
        dr = pow(r, float(N) - 1.0) * float(N) * dr + 1.0;

        float zr = pow(r, float(N));
        t *= float(N);
        f *= float(N);

        z = zr * vec3(sin(t) * cos(f), sin(t) * sin(f), cos(t));
        z += p;
    }

    return 0.5 * log(r) * r / dr;
}

float world(vec3 p) {
    // p = rotate(p);
    // p.xz *= op_rotate(mouseX / 400. * 10.0);

    // float sphere = length(rotate(p)) - 1.;
    // float plane = p.y;
    // p.xz *= Rotate(-sin(float(time) * 0.002));
    // p.yz *= Rotate(cos(float(time) * 0.003));
    // p.xyz = rotate(p);
    p *= mMatrix;
    float mandelbulb = mandelbulbVertex(p);

    // return min(sphere, plane);

    return mandelbulb;
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(map(cameraDistance, 1., 5., 0.001, 0.05), 0.);
    // vec2 e = vec2(0.001, 0.);
    float d = world(p);
    vec3 n = d - vec3(world(p - e.xyy), world(p - e.yxy), world(p - e.yyx));
    return normalize(n);

    vec3 trash;

    // float h = map(cameraDistance, 1., 5., 0.001, 0.05);
    // const vec2 k = vec2(1,-1);
    // return normalize(
    //     k.xyy * world(p + k.xyy * h) + 
    //     k.yyx * world(p + k.yyx * h) + 
    //     k.yxy * world(p + k.yxy * h) + 
    //     k.xxx * world(p + k.xxx * h)
    // );
}

float diffuseLighting(vec3 p, vec3 rd) {
    vec3 lp = vec3(0., 0., -cameraDistance);

    vec3 light = normalize(lp - p);
    vec3 normal = getNormal(p);
    vec3 reflection = reflect(rd, normal);

    float diffuse = clamp(dot(normal, light), 0., 1.);

    return diffuse;
}

float rayMarcher(vec3 ro, vec3 rd) {
    float diffuse;

    float distanceOrigin = 0.;

    int steps;
    vec3 rp = ro;

    for(int i = 0; i < MAX_RAY_STEPS; i++) {
        steps = i;
        rp = ro + distanceOrigin * rd;

        float map = world(rp);

        distanceOrigin += map;

        if(MAX_MARCH_DISTANCE < distanceOrigin)
            break;

        // diffuse = diffuseLighting(rp, rd);
    }

    // float zDepth = distanceOrigin / abs(ro.z);

    // return map(distanceOrigin, 0., MAX_MARCH_DISTANCE, 1., 0.);
    return distanceOrigin;
}

void main() {
    // vec3 cameraPos = vec3(cameraCenter + vec3(0., 0., -2.));

    vec3 ro = vec3(cameraCenter + vec3(0, 0, -cameraDistance));
    vec3 rd = normalize(vec3(-position2.x, position2.y, 1.));

    // float diffuse = rayMarcher(ro, rd);

    vec3 col = vec3(0.);

    vec3 lig = vec3(-5., 5., -cameraDistance);

    for(int i = 0; i < 5; i++) {
        float t = rayMarcher(ro, rd);
        if(t > 0. && t < MAX_MARCH_DISTANCE) {
            vec3 reflectionColor = vec3(0.);

            col = vec3(1.);

            vec3 posWS = ro + rd * t;
            vec3 norWS = getNormal(posWS);
            vec3 ref = reflect(rd, norWS);

            vec3 ambient = vec3(.5, .2, .5);

            vec3 diffuseR = vec3(dot(normalize(lig), normalize(norWS)));

            ro = posWS + norWS;
            rd = ref;

            reflectionColor += ambient;
            reflectionColor += diffuseR;

            col = reflectionColor;
        }

    }

    gl_FragColor = vec4(col, 1.);

    // gl_FragColor = vec4(vec3(1. - diffuse), 1.);
}
