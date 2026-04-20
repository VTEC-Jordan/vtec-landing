// Silk hero background — pure WebGL, no external dependencies
// Ported from React Bits Silk component

document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('partner-silk');
    if (!container) return;

    // ── Config ────────────────────────────────────────────────
    var SPEED   = 3.0;
    var SCALE   = 1.5;
    var COLOR   = [0x00 / 255, 0x6D / 255, 0x77 / 255]; // #006D77 site teal
    var NOISE   = 1.5;
    var ROT     = 0.5;
    var dpr     = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1 : 2);

    // ── Canvas + context ──────────────────────────────────────
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    container.appendChild(canvas);

    var gl = canvas.getContext('webgl')
          || canvas.getContext('experimental-webgl');
    if (!gl) return;

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    // ── Shaders ───────────────────────────────────────────────
    var VS = [
        'attribute vec2 position;',
        'varying vec2 vUv;',
        'void main(){',
        '  vUv=position*0.5+0.5;',
        '  gl_Position=vec4(position,0.0,1.0);',
        '}'
    ].join('\n');

    var FS = [
        'precision mediump float;',
        'varying vec2 vUv;',
        'uniform float uTime;',
        'uniform vec3  uColor;',
        'uniform float uSpeed;',
        'uniform float uScale;',
        'uniform float uRotation;',
        'uniform float uNoiseIntensity;',

        'const float e=2.71828182845904523536;',

        'float noise(vec2 texCoord){',
        '  float G=e;',
        '  vec2 r=(G*sin(G*texCoord));',
        '  return fract(r.x*r.y*(1.0+texCoord.x));',
        '}',

        'vec2 rotateUvs(vec2 uv,float angle){',
        '  float c=cos(angle),s=sin(angle);',
        '  mat2 rot=mat2(c,-s,s,c);',
        '  return rot*uv;',
        '}',

        'void main(){',
        '  float rnd=noise(gl_FragCoord.xy);',
        '  vec2 uv=rotateUvs(vUv*uScale,uRotation);',
        '  vec2 tex=uv*uScale;',
        '  float tOffset=uSpeed*uTime;',
        '  tex.y+=0.03*sin(8.0*tex.x-tOffset);',
        '  float pattern=0.6+0.4*sin(',
        '    5.0*(tex.x+tex.y+cos(3.0*tex.x+5.0*tex.y)+0.02*tOffset)',
        '    +sin(20.0*(tex.x+tex.y-0.1*tOffset)));',
        '  vec3 col=uColor*pattern;',
        '  col-=vec3(rnd/15.0*uNoiseIntensity);',
        '  col=clamp(col,0.0,1.0);',
        '  gl_FragColor=vec4(col,1.0);',
        '}'
    ].join('\n');

    // ── Compile helpers ───────────────────────────────────────
    function compileShader(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // ── Fullscreen quad ───────────────────────────────────────
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,  1, -1,  -1,  1,
         1, -1,  1,  1,  -1,  1
    ]), gl.STATIC_DRAW);
    var posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // ── Uniform locations (cached) ────────────────────────────
    var U = {};
    ['uTime', 'uColor', 'uSpeed', 'uScale', 'uRotation', 'uNoiseIntensity'].forEach(function (n) {
        U[n] = gl.getUniformLocation(prog, n);
    });

    // Static uniforms
    gl.uniform3f(U.uColor,         COLOR[0], COLOR[1], COLOR[2]);
    gl.uniform1f(U.uSpeed,         SPEED);
    gl.uniform1f(U.uScale,         SCALE);
    gl.uniform1f(U.uRotation,      ROT);
    gl.uniform1f(U.uNoiseIntensity, NOISE);
    gl.uniform1f(U.uTime,          0);

    // ── Resize ────────────────────────────────────────────────
    function resize() {
        var w = Math.max(1, container.clientWidth);
        var h = Math.max(1, container.clientHeight);
        canvas.width  = w * dpr;
        canvas.height = h * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    var ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // ── Render loop ───────────────────────────────────────────
    var t0 = performance.now();
    var rafId = null;
    var paused = false;
    function render(ts) {
        if (!paused) {
            gl.uniform1f(U.uTime, (ts - t0) * 0.001);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        rafId = requestAnimationFrame(render);
    }
    document.addEventListener('visibilitychange', function () {
        paused = document.hidden;
        if (!paused && !rafId) { t0 = performance.now(); rafId = requestAnimationFrame(render); }
    });
    rafId = requestAnimationFrame(render);
});
