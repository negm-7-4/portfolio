import { useEffect, useRef } from "react";

/* ── Vertex shader ─────────────────────────────────────────── */
const VERT = `#version 300 es
in vec2 a;
void main(){ gl_Position=vec4(a,0.,1.); }`;

/* ── Fragment shader: domain-warped FBM aurora ─────────────────
   The whole page is one continuous cinematic world. As the visitor
   scrolls (P: 0 at the top → 1 at the bottom) the atmosphere is
   colour-graded through four "acts", the field drifts like a slow
   camera descent, and a light bloom follows the cursor. One draw call
   per frame — no Three.js overhead.                                  */
const FRAG = `#version 300 es
precision mediump float;
uniform float T;   // seconds since start
uniform vec2  R;   // resolution (px)
uniform vec2  M;   // mouse (px)
uniform float S;   // raw scrollY (px) — legacy fine drift
uniform float P;   // page progress 0..1 (smoothed)
out vec4 O;

float h(vec2 p){
  p=fract(p*vec2(127.1,311.7));
  p+=dot(p,p+45.32);
  return fract(p.x*p.y);
}
float vn(vec2 p){
  vec2 i=floor(p), f=smoothstep(0.,1.,fract(p));
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),
             mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p, int n){
  float v=0.,a=.5,q=1.;
  for(int i=0;i<6;i++){ if(i>=n) break; v+=vn(p*q)*a; a*=.5; q*=2.1; }
  return v;
}

/* Smooth 3-segment blend across the four cinematic acts. */
vec3 act4(vec3 a, vec3 b, vec3 c, vec3 d, float p){
  vec3 ab = mix(a, b, smoothstep(0.02, 0.40, p));
  vec3 cd = mix(c, d, smoothstep(0.62, 0.98, p));
  return mix(ab, cd, smoothstep(0.34, 0.72, p));
}

void main(){
  vec2 uv=gl_FragCoord.xy/R;

  /* slow camera descent — the field drifts as the page progresses,
     so scrolling reads as travelling down through the environment */
  float t=T*.042, sc=S*.00014;
  vec2 puv = uv + vec2(0.0, P*0.85);

  /* cursor light bloom */
  vec2 mp=M/R; mp.y=1.-mp.y;
  float mg=.16*exp(-dot(uv-mp,uv-mp)*3.2);

  /* domain-warped FBM — warp layer q, then final field */
  vec2 q=vec2(
    fbm(puv*1.1+vec2(t,sc),3),
    fbm(puv*1.1+vec2(sc+1.7,t*.9),3)
  );
  float f=fbm(puv*1.5+q*.55+vec2(t*.35,sc),4)+mg;
  f=clamp(f,0.,1.);

  /* ── Colour-graded acts ──────────────────────────────────────
     Every anchor stays low-saturation / premium; only the
     temperature shifts so the site feels like one evolving world:
       act 0  cold steel-blue   (hero)
       act 1  warm graphite     (work / process)
       act 2  midnight indigo   (projects)
       act 3  dawn silver-lift  (contact)                          */
  vec3 baseA=vec3(.043,.051,.067), hiA=vec3(.212,.255,.318);
  vec3 baseB=vec3(.055,.052,.052), hiB=vec3(.246,.232,.198);
  vec3 baseC=vec3(.045,.043,.074), hiC=vec3(.196,.182,.300);
  vec3 baseD=vec3(.064,.070,.086), hiD=vec3(.300,.330,.386);

  vec3 base = act4(baseA, baseB, baseC, baseD, P);
  vec3 hi   = act4(hiA,   hiB,   hiC,   hiD,   P);
  vec3 mid  = mix(base, hi, 0.42);

  vec3 col = mix(base, base*1.35, smoothstep(.22,.48,f));
  col = mix(col, mid, smoothstep(.44,.70,f));
  col = mix(col, hi,  smoothstep(.64,.86,f)*.60);

  /* micro sparkles */
  float sp=vn(uv*42.+T*.3);
  col+=pow(max(sp-.70,0.)/.30,3.)*.035;

  /* cursor bloom lifts the local colour a touch */
  col += hi*mg*0.6;

  /* radial vignette */
  float vig=1.-smoothstep(.38,1.18,length((uv-.5)*vec2(1.0,1.4)));
  col*=.58+.42*vig;

  /* film grain */
  float g=h(uv+vec2(fract(T*.07),fract(T*.13)));
  col+=(g-.5)*.007;

  O=vec4(col,1.);
}`;

function mkSh(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    console.warn("[WebGLBg]", gl.getShaderInfoLog(s));
  return s;
}

/**
 * Full-screen GLSL background.
 * Domain-warped FBM noise → flowing aurora in a premium dark palette.
 * The atmosphere is colour-graded by page-scroll progress so the whole
 * site reads as one continuous cinematic environment. Reacts to the
 * cursor and scroll. Zero Three.js overhead — one draw call per frame.
 */
export default function WebGLBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const gl = c.getContext("webgl2", {
      alpha: false, antialias: false, powerPreference: "default",
    });
    if (!gl) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, mkSh(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mkSh(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const aLoc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    const uT = gl.getUniformLocation(prog, "T");
    const uR = gl.getUniformLocation(prog, "R");
    const uM = gl.getUniformLocation(prog, "M");
    const uS = gl.getUniformLocation(prog, "S");
    const uP = gl.getUniformLocation(prog, "P");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let sy = 0, raf = 0;
    let pTarget = 0, pSmooth = 0;   // page progress: raw target → filmic smoothed
    let running = true;
    let lastActivity = performance.now();
    let lastDraw = 0;
    const t0 = performance.now();
    // Cap device pixel ratio so HiDPI screens don't double our fragment work
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // Honour "reduce motion": drop the autonomous animation loop and only
    // redraw on real user input (scroll / pointer / resize).
    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const readProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      pTarget = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    const draw = (now, p) => {
      gl.useProgram(prog);
      gl.uniform1f(uT, reduce ? 0 : (now - t0) * 0.001);
      gl.uniform2f(uR, c.width, c.height);
      gl.uniform2f(uM, mx * dpr, my * dpr);
      gl.uniform1f(uS, sy);
      gl.uniform1f(uP, p);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    // Reduced-motion: snap progress and paint a single static frame.
    const drawOnce = () => {
      pSmooth = pTarget;
      draw(performance.now(), pSmooth);
    };

    // Continuous animation loop (skipped entirely under reduce-motion).
    const tick = () => {
      const now = performance.now();
      // Filmic easing of the scroll-driven palette so act transitions
      // glide instead of snapping frame-to-frame.
      pSmooth += (pTarget - pSmooth) * 0.06;
      const idle = now - lastActivity > 2500 &&
                   Math.abs(pTarget - pSmooth) < 0.001;
      const minFrameMs = idle ? 32 : 0;  // ~30fps idle, otherwise full speed
      if (now - lastDraw >= minFrameMs) {
        lastDraw = now;
        draw(now, pSmooth);
      }
      if (running) raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      const W = window.innerWidth, H = window.innerHeight;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      c.style.width = W + "px"; c.style.height = H + "px";
      gl.viewport(0, 0, c.width, c.height);
      readProgress();
      if (reduce) requestAnimationFrame(drawOnce);
    };
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY; lastActivity = performance.now();
      if (reduce) requestAnimationFrame(drawOnce);
    };
    const onScroll = () => {
      sy = window.scrollY; lastActivity = performance.now();
      readProgress();
      if (reduce) requestAnimationFrame(drawOnce);
    };

    // Pause rendering when the tab is hidden — saves significant CPU/battery.
    const onVis = () => {
      if (reduce) return;
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        lastActivity = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    onResize();
    window.addEventListener("resize",    onResize);
    window.addEventListener("mousemove", onMove,   { passive: true });
    window.addEventListener("scroll",    onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    if (reduce) {
      requestAnimationFrame(drawOnce);   // single static frame, then on-demand
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll",    onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 -z-10 block"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
