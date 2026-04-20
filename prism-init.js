// Prism hero background — pure WebGL, no external dependencies
// Ported from React Bits Prism component (OGL version)

document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('workshops-prism');
    if (!container) return;

    // ── Config ────────────────────────────────────────────────
    var H          = 3.5;
    var BASE_HALF  = 2.75;   // baseWidth 5.5 * 0.5
    var GLOW       = 1.0;
    var NOISE      = 0.5;
    var SAT        = 1.5;    // transparent = true → 1.5
    var SCALE      = 3.6;
    var CFREQ      = 1.0;
    var BLOOM      = 1.0;
    var TS         = 0.5;
    var HUE        = 0.0;
    var MIN_AXIS   = Math.min(BASE_HALF, H);
    var dpr        = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1 : 2);
    var isMobile   = window.innerWidth <= 768;

    // ── Canvas + context ──────────────────────────────────────
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    container.appendChild(canvas);

    var gl = canvas.getContext('webgl', { alpha: true })
          || canvas.getContext('experimental-webgl', { alpha: true });
    if (!gl) return;

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    // ── Shaders ───────────────────────────────────────────────
    var VS = 'attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}';

    var FS = [
        'precision highp float;',
        'uniform vec2  iResolution;',
        'uniform float iTime;',
        'uniform float uHeight;',
        'uniform float uBaseHalf;',
        'uniform mat3  uRot;',
        'uniform int   uUseBaseWobble;',
        'uniform float uGlow;',
        'uniform vec2  uOffsetPx;',
        'uniform float uNoise;',
        'uniform float uSaturation;',
        'uniform float uScale;',
        'uniform float uHueShift;',
        'uniform float uColorFreq;',
        'uniform float uBloom;',
        'uniform float uCenterShift;',
        'uniform float uInvBaseHalf;',
        'uniform float uInvHeight;',
        'uniform float uMinAxis;',
        'uniform float uPxScale;',
        'uniform float uTimeScale;',

        'vec4 tanh4(vec4 x){',
        '  vec4 e2x=exp(2.0*x);',
        '  return (e2x-1.0)/(e2x+1.0);',
        '}',

        'float rand(vec2 co){',
        '  return fract(sin(dot(co,vec2(12.9898,78.233)))*43758.5453123);',
        '}',

        'float sdOctaAnisoInv(vec3 p){',
        '  vec3 q=vec3(abs(p.x)*uInvBaseHalf,abs(p.y)*uInvHeight,abs(p.z)*uInvBaseHalf);',
        '  float m=q.x+q.y+q.z-1.0;',
        '  return m*uMinAxis*0.5773502691896258;',
        '}',

        'float sdPyramidUpInv(vec3 p){',
        '  return max(sdOctaAnisoInv(p),-p.y);',
        '}',

        'mat3 hueRotation(float a){',
        '  float c=cos(a),s=sin(a);',
        '  mat3 W=mat3(0.299,0.587,0.114,0.299,0.587,0.114,0.299,0.587,0.114);',
        '  mat3 U=mat3(0.701,-0.587,-0.114,-0.299,0.413,-0.114,-0.300,-0.588,0.886);',
        '  mat3 V=mat3(0.168,-0.331,0.500,0.328,0.035,-0.500,-0.497,0.296,0.201);',
        '  return W+U*c+V*s;',
        '}',

        'void main(){',
        '  vec2 f=(gl_FragCoord.xy-0.5*iResolution.xy-uOffsetPx)*uPxScale;',
        '  float z=5.0,d=0.0;',
        '  vec3 p;',
        '  vec4 o=vec4(0.0);',
        '  float cf=uColorFreq;',
        '  mat2 wob=mat2(1.0,0.0,0.0,1.0);',
        '  if(uUseBaseWobble==1){',
        '    float t=iTime*uTimeScale;',
        '    float c0=cos(t);',
        '    float c1=cos(t+33.0);',
        '    float c2=cos(t+11.0);',
        '    wob=mat2(c0,c1,c2,c0);',
        '  }',
        '  for(int i=0;i<100;i++){',
        '    p=vec3(f,z);',
        '    p.xz=p.xz*wob;',
        '    p=uRot*p;',
        '    vec3 q=p;',
        '    q.y+=uCenterShift;',
        '    d=0.1+0.2*abs(sdPyramidUpInv(q));',
        '    z-=d;',
        '    o+=(sin((p.y+z)*cf+vec4(0.0,1.0,2.0,3.0))+1.0)/d;',
        '  }',
        '  o=tanh4(o*o*(uGlow*uBloom)/1e5);',
        '  vec3 col=o.rgb;',
        '  float n=rand(gl_FragCoord.xy+vec2(iTime));',
        '  col+=(n-0.5)*uNoise;',
        '  col=clamp(col,0.0,1.0);',
        '  float L=dot(col,vec3(0.2126,0.7152,0.0722));',
        '  col=clamp(mix(vec3(L),col,uSaturation),0.0,1.0);',
        '  if(abs(uHueShift)>0.0001){',
        '    col=clamp(hueRotation(uHueShift)*col,0.0,1.0);',
        '  }',
        '  gl_FragColor=vec4(col,o.a);',
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

    // ── Fullscreen triangle ───────────────────────────────────
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // ── Cache all uniform locations ───────────────────────────
    var U = {};
    [
        'iResolution', 'iTime', 'uHeight', 'uBaseHalf', 'uRot', 'uUseBaseWobble',
        'uGlow', 'uOffsetPx', 'uNoise', 'uSaturation', 'uScale', 'uHueShift',
        'uColorFreq', 'uBloom', 'uCenterShift', 'uInvBaseHalf', 'uInvHeight',
        'uMinAxis', 'uPxScale', 'uTimeScale'
    ].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    // Static uniforms
    gl.uniform1f(U.uHeight,     H);
    gl.uniform1f(U.uBaseHalf,   BASE_HALF);
    gl.uniform1i(U.uUseBaseWobble, 1);
    gl.uniform1f(U.uGlow,       GLOW);
    gl.uniform2f(U.uOffsetPx,   0, 0);
    gl.uniform1f(U.uNoise,      NOISE);
    gl.uniform1f(U.uSaturation, SAT);
    gl.uniform1f(U.uScale,      SCALE);
    gl.uniform1f(U.uHueShift,   HUE);
    gl.uniform1f(U.uColorFreq,  CFREQ);
    gl.uniform1f(U.uBloom,      BLOOM);
    gl.uniform1f(U.uCenterShift, H * 0.25);
    gl.uniform1f(U.uInvBaseHalf, 1 / BASE_HALF);
    gl.uniform1f(U.uInvHeight,   1 / H);
    gl.uniform1f(U.uMinAxis,    MIN_AXIS);
    gl.uniform1f(U.uTimeScale,  TS);
    // Identity rotation matrix (col-major)
    gl.uniformMatrix3fv(U.uRot, false, new Float32Array([1,0,0, 0,1,0, 0,0,1]));

    // ── Resize ────────────────────────────────────────────────
    function resize() {
        var w = Math.max(1, container.clientWidth);
        var h = Math.max(1, container.clientHeight);
        canvas.width  = w * dpr;
        canvas.height = h * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(U.iResolution, canvas.width, canvas.height);
        gl.uniform1f(U.uPxScale, 1 / (canvas.height * 0.1 * SCALE));
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
            gl.uniform1f(U.iTime, (ts - t0) * 0.001);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        rafId = requestAnimationFrame(render);
    }
    document.addEventListener('visibilitychange', function () {
        paused = document.hidden;
        if (!paused && !rafId) { t0 = performance.now(); rafId = requestAnimationFrame(render); }
    });
    rafId = requestAnimationFrame(render);
});
