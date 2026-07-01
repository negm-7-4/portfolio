import { useEffect, useRef } from "react";

/**
 * WebGLImage — a project screenshot rendered on a WebGL quad so the cursor
 * ripples and RGB-splits the image on hover, turning each flat preview into a
 * living surface. Self-contained raw WebGL (no dependency); degrades to a plain
 * <img> on touch / reduced-motion / no-WebGL, where the flourish adds nothing.
 *
 *  • idle      → a single static cover-fit frame is drawn, then the loop stops
 *                (zero GPU cost at rest — most of the page's life).
 *  • hover     → the loop spins up; a soft displacement + chromatic split
 *                follows the pointer and eases back out on leave.
 *
 * The real <img> stays in the DOM underneath for accessibility, lazy-loading
 * and as the fallback, so nothing is lost if WebGL is unavailable.
 */

const VERT = `
  attribute vec2 aPos;
  varying vec2 vUv;
  void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`;

const FRAG = `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2  uScale;   // cover-fit
  uniform vec2  uMouse;   // 0..1, uv space
  uniform float uHover;   // 0..1 eased
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = (vUv - 0.5) * uScale + 0.5;

    vec2 dir  = uv - uMouse;
    float d   = length(dir);
    float infl = smoothstep(0.55, 0.0, d) * uHover;

    // ripple pushes texels away from the cursor
    float ripple = sin(d * 16.0 - uTime * 3.0) * 0.5 + 0.5;
    vec2 disp = normalize(dir + 0.0001) * infl * 0.028 * ripple;

    // chromatic split scales with influence
    float split = infl * 0.012;
    float r = texture2D(uTex, uv - disp + vec2(split, 0.0)).r;
    float g = texture2D(uTex, uv - disp).g;
    float b = texture2D(uTex, uv - disp - vec2(split, 0.0)).b;

    vec3 col = vec3(r, g, b);
    col += infl * 0.05;               // faint lift under the cursor
    gl_FragColor = vec4(col, 1.0);
  }
`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function WebGLImage({ src, alt, className = "" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    // Opt out where the effect is pointless or unsupported.
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduce) return;

    const gl =
      canvas.getContext("webgl", { alpha: false, antialias: true, depth: false }) ||
      canvas.getContext("experimental-webgl");
    if (!gl) return;

    const prog = gl.createProgram();
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTex = gl.getUniformLocation(prog, "uTex");
    const uScale = gl.getUniformLocation(prog, "uScale");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uHover = gl.getUniformLocation(prog, "uHover");
    const uTime = gl.getUniformLocation(prog, "uTime");

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const state = {
      hover: 0,
      hoverTarget: 0,
      mx: 0.5,
      my: 0.5,
      imgW: 1,
      imgH: 1,
      loaded: false,
      raf: 0,
      running: false,
      t0: performance.now(),
      disposed: false,
    };

    const setScale = () => {
      const w = canvas.width || 1;
      const h = canvas.height || 1;
      const contA = w / h;
      const imgA = state.imgW / state.imgH;
      let sx = 1;
      let sy = 1;
      if (contA >= imgA) sy = imgA / contA;
      else sx = contA / imgA;
      gl.uniform2f(uScale, sx, sy);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        setScale();
      }
    };

    const draw = () => {
      gl.uniform2f(uMouse, state.mx, state.my);
      gl.uniform1f(uHover, state.hover);
      gl.uniform1f(uTime, (performance.now() - state.t0) / 1000);
      gl.uniform1i(uTex, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const loop = () => {
      if (state.disposed) return;
      state.hover += (state.hoverTarget - state.hover) * 0.12;
      draw();
      // Keep spinning while there's motion; park once fully settled.
      if (state.hover > 0.001 || state.hoverTarget > 0) {
        state.raf = requestAnimationFrame(loop);
      } else {
        state.hover = 0;
        draw(); // final clean frame
        state.running = false;
      }
    };

    const kick = () => {
      if (!state.running && !state.disposed) {
        state.running = true;
        state.raf = requestAnimationFrame(loop);
      }
    };

    // ── pointer wiring ──
    const onEnter = () => {
      state.hoverTarget = 1;
      kick();
    };
    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      state.mx = (e.clientX - r.left) / r.width;
      state.my = 1 - (e.clientY - r.top) / r.height; // flip to uv space
    };
    const onLeave = () => {
      state.hoverTarget = 0;
      kick();
    };
    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    const ro = new ResizeObserver(() => {
      resize();
      if (state.loaded && !state.running) draw();
    });
    ro.observe(wrap);

    // ── load the texture ──
    const image = new Image();
    image.decoding = "async";
    image.src = src;
    image.onload = () => {
      if (state.disposed) return;
      state.imgW = image.naturalWidth || 1;
      state.imgH = image.naturalHeight || 1;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      state.loaded = true;
      resize();
      draw(); // first static frame
      // Only reveal the canvas once it has actually drawn — a shader/link
      // failure earlier would have bailed out and left the <img> showing.
      canvas.style.opacity = "1";
      if (imgRef.current) imgRef.current.style.opacity = "0"; // hand off to canvas
    };

    resize();

    return () => {
      state.disposed = true;
      cancelAnimationFrame(state.raf);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      image.onload = null;
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      const lose = gl.getExtension("WEBGL_lose_context");
      lose?.loseContext();
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={`absolute inset-0 h-full w-full ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        width="1200"
        height="705"
        className="absolute inset-0 h-full w-full object-cover object-top"
        style={{ transition: "opacity 0.3s" }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
