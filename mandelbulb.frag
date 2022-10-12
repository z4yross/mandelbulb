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

const float ABSORPTION_COEFFICIENT = 0.9;
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

float BeerLambert(float absorbtionCoeficient, float distanceTraveled) {
    return exp(-absorbtionCoeficient * distanceTraveled);
}

mat2 Rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat2(c, -s, s, c);
}

float mandelbulbVertex(vec3 pos) {
    vec3 p = pos;

    float r = 0.;
    float dw = 1.0;
    vec3 w = p;

    for(int l = 0; l < MAX_ITERATIONS; l++) {
        // r = length(rotate(z));

        // // TRIGONOMETRIC VERSION
        dw = pow(r, float(N) - 1.) * float(N) * dw + 1.;

        r = length(w);
        float f = atan(w.y, w.x);
        float t = acos(w.z / r);

        float zr = pow(r, float(N));
        t *= float(N);
        f *= float(N);

        w = p + zr * vec3(sin(t) * cos(f), sin(t) * sin(f), cos(t));

        if(r > 2.)
            break;
    }

    float dist = 0.5 * log(r) * r / dw;

    // return dist > 1. ? 100000. : dist;

    return dist;

    // return 0.5 * log(r) * r / dw;
}

float world(vec3 p) {
    // p = rotate(p);
    // p.xz *= op_rotate(mouseX / 400. * 10.0);

    // float sphere = length(p) - 1.;
    // float plane = p.y;
    // p.xz *= Rotate(-sin(float(time) * 0.002));
    // p.yz *= Rotate(cos(float(time) * 0.003));
    // p.xyz = rotate(p);
    p *= mMatrix;
    float mandelbulb = mandelbulbVertex(p);
    // float sphere = length(p) - 1.;

    // return min(sphere, plane);

    return mandelbulb;
}

vec3 calcNormal(vec3 p){

    float h = map(cameraDistance, 1., 5., 0.001, 0.05); // replace by an appropriate value
    const vec2 k = vec2(1,-1);
    return normalize( k.xyy*world( p + k.xyy*h ) + 
                      k.yyx*world( p + k.yyx*h ) + 
                      k.yxy*world( p + k.yxy*h ) + 
                      k.xxx*world( p + k.xxx*h ) );
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

    float stepSize = .6;
    vec3 rp = ro;

    for(int i = 0; i < MAX_RAY_STEPS; i++) {

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

vec3 rayMarcherVol(vec3 ro, vec3 rd) {
    float diffuse;

    float distanceOrigin = 0.;

    float stepSize = .6;
    vec3 rp = ro;

    vec3 lig = vec3(-2., 2., 0);
    float opaqueVisibility = 1.;

    vec3 volumetricColor = vec3(0.);
    vec3 volumeAlbedo = vec3(.8);

    for(int i = 0; i < MAX_RAY_STEPS; i++) {

        rp = ro + distanceOrigin * rd;

        float map = world(rp);

        distanceOrigin += map;

        if(MAX_MARCH_DISTANCE < length(rp))
            break;

        if(map > 0.) {
            // vec3 posR = ro + rd * t;

            float previousOpaqueVisibility = opaqueVisibility;
            opaqueVisibility *= BeerLambert(ABSORPTION_COEFFICIENT, map);
            float absorptionFromMarch = previousOpaqueVisibility - opaqueVisibility;

            vec3 lightColorA = dot(normalize(lig), normalize(rp)) * vec3(0., .5, 0.);

            for(int lightIndex = 0; lightIndex < 1; lightIndex++) {
                float lightDistance = length((vec3(1., 1., -2.) - rp));
                float attenuation = 1.0 / (1.0 + lightDistance);
                vec3 lightColor = vec3(.3, 0., .6) + attenuation;
                volumetricColor += absorptionFromMarch * volumeAlbedo * lightColor;
            }

            volumetricColor += absorptionFromMarch * volumeAlbedo * lightColorA;
        }

        // diffuse = diffuseLighting(rp, rd);
    }

    // float zDepth = distanceOrigin / abs(ro.z);

    // return map(distanceOrigin, 0., MAX_MARCH_DISTANCE, 1., 0.);
    return volumetricColor;
}

float constantStepRayMarcher(vec3 ro, vec3 rd) {
    float stepSize = 0.6;
    float distanceOrigin = 0.;

    vec3 rp = ro;

    for(int i = 0; i < MAX_RAY_STEPS; i++) {

        distanceOrigin = world(rp);
        if(distanceOrigin < 0.001)
            return float(i) / float(MAX_RAY_STEPS);
        rp = ro + distanceOrigin * rd;
    }

    return 0.;
}

void main() {
    // vec3 cameraPos = vec3(cameraCenter + vec3(0., 0., -2.));

    // vec3 ro = vec3(position2.x, position2.y, -1.14);
    // vec3 rd = normalize(ro - cameraCenter);

    vec3 ro = vec3(cameraCenter + vec3(0, 0, -cameraDistance));
    vec3 rd = normalize(vec3(-position2.x, position2.y, 1.));

    // float diffuse = rayMarcher(ro, rd);

    vec3 col = vec3(0.);

    vec3 lig = vec3(-5., 5., -cameraDistance);
    float opaqueVisibility = 1.;

    vec3 volumetricColor = vec3(0.);
    vec3 volumeAlbedo = vec3(0.8);

    for(int i = 0; i < 5; i++) {
        float t = rayMarcher(ro, rd);

        // if(t > 1e20)
        //     break;

        // col = t;

        if(t > 0.) {
            vec3 reflectionColor = vec3(0.);

            col = vec3(1.);

            vec3 posWS = ro + rd * t;
            vec3 norWS = calcNormal(posWS);
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
