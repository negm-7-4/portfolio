import { useEffect, useRef } from "react";

/* ── Vertex shader ─────────────────────────────────────────── */
const VERT = `#version 300 es
in vec2 a;
void main(){ gl_Position=vec4(a,0.,1.); }`;

/* ── Fragment shader: domain-warped FBM aurora ─────────────── */
const FRAG = `#version 300 es
precision mediump float;
uniform float T;
uniform vec2  R;
uniform vec2  M;
uniform float S;
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

void main(){
  vec2 uv=gl_FragCoord.xy/R;
  /* faster living flow + stronger scroll coupling so scrolling literally
     pushes the aurora — the "ambient video" feel */
  float t=T*.055, sc=S*.00026;

  /* mouse aura */
  vec2 mp=M/R; mp.y=1.-mp.y;
  float mg=.13*exp(-dot(uv-mp,uv-mp)*3.5);

  /* domain-warped FBM — warp layer q, then final field */
  vec2 q=vec2(
    fbm(uv*1.1+vec2(t,sc),3),
    fbm(uv*1.1+vec2(sc+1.7,t*.9),3)
  );
  float f=fbm(uv*1.5+q*.55+vec2(t*.35,sc),4)+mg;
  f=clamp(f,0.,1.);

  /* ink → midnight → cold-steel → silver-blue */
  vec3 c0=vec3(.043,.051,.067);
  vec3 c1=vec3(.072,.087,.112);
  vec3 c2=vec3(.114,.137,.175);
  vec3 c3=vec3(.212,.255,.318);
  vec3 col=mix(c0,c1,smoothstep(.22,.48,f));
  col=mix(col,c2,smoothstep(.44,.70,f));
  col=mix(col,c3,smoothstep(.64,.84,f)*.55);

  /* drifting volumetric light blooms — cheap 2-octave field that slides
     across the frame, giving the aurora a continuous cinematic motion */
  float lb=fbm(uv*0.9+vec2(t*0.8,-t*0.5)+q*0.3,2);
  col+=vec3(.10,.123,.162)*pow(max(lb-.55,0.)/.45,2.)*0.6;

  /* slow global breathing so the whole field gently pulses with light */
  col*=1.0+0.035*sin(T*0.18);

  /* micro sparkles */
  float sp=vn(uv*42.+T*.3);
  col+=pow(max(sp-.70,0.)/.30,3.)*.035;

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
 * Reacts to mouse position and scroll. Zero Three.js overhead — one draw call per frame.
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

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let sy = 0, W = 0, H = 0, raf = 0;
    let running = true;
    let lastActivity = performance.now();
    const t0 = performance.now();
    // Cap device pixel ratio aggressively — fragment work scales with pixel
    // count, so 1.25 keeps HiDPI screens fast with no perceptible loss on a
    // soft, blurry aurora.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      c.style.width = W + "px"; c.style.height = H + "px";
      gl.viewport(0, 0, c.width, c.height);
    };
    const onMove   = (e) => { mx = e.clientX; my = e.clientY; lastActivity = performance.now(); };
    const onScroll = () => { sy = window.scrollY; lastActivity = performance.now(); };

    // Pause rendering when the tab is hidden — saves significant CPU/battery.
    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    onResize();
    window.addEventListener("resize",    onResize);
    window.addEventListener("mousemove", onMove,   { passive: true });
    window.addEventListener("scroll",    onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    // Throttle to ~30fps when there's been no cursor/scroll activity for
    // a few seconds. The shader still drifts continuously but the cost
    // is halved while the user isn't doing anything.
    let lastDraw = 0;
    const tick = () => {
      const now = performance.now();
      const idle = now - lastActivity > 1500;
      const minFrameMs = idle ? 40 : 0;  // ~24fps idle, otherwise full speed
      if (now - lastDraw >= minFrameMs) {
        lastDraw = now;
        gl.useProgram(prog);
        gl.uniform1f(uT, (now - t0) * 0.001);
        gl.uniform2f(uR, c.width, c.height);
        gl.uniform2f(uM, mx * dpr, my * dpr);
        gl.uniform1f(uS, sy);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      if (running) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

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
