import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

/**
 * FresnelMaterial — a hand-written GLSL surface used on the cinematic
 * sculptures. It is two ideas in one shader:
 *
 *  1. Organic vertex displacement: cheap stacked sine/curl noise pushes the
 *     vertices along their normals so the forms breathe and ripple instead of
 *     sitting rigid. No textures, no heavy 3D noise — a few trig ops.
 *
 *  2. Fresnel rim emission: surfaces facing away from the camera glow with the
 *     rim colour, faces pointing at the camera stay dark. This is what gives
 *     the silver-blue "energy glass" read, and it pairs with bloom so the
 *     edges bleed light.
 *
 * Transparent + additive-leaning so it layers as a glowing shell over a solid
 * metallic core mesh.
 */
const FresnelMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uColorCore: new THREE.Color("#1a2230"),
    uColorRim: new THREE.Color("#aab4c4"),
    uColorHot: new THREE.Color("#e8eefb"),
    uFresnelPower: 2.4,
    uDisplace: 0.12,
    uFreq: 1.6,
    uOpacity: 1.0,
    uScrollPulse: 0.0,
  },
  /* ── vertex ── */ /* glsl */ `
    uniform float uTime;
    uniform float uDisplace;
    uniform float uFreq;
    uniform float uScrollPulse;

    varying vec3  vWorldNormal;
    varying vec3  vViewDir;
    varying float vDisp;

    // Cheap value-noise-ish field from stacked sines. Smooth, seamless,
    // and basically free compared to real simplex noise.
    float wave(vec3 p, float t) {
      float a = sin(p.x * uFreq + t) * cos(p.y * uFreq * 1.3 - t * 0.8);
      float b = sin(p.z * uFreq * 0.9 + t * 1.1) * cos(p.x * uFreq * 1.1 + t * 0.6);
      float c = sin((p.y + p.z) * uFreq * 0.7 - t * 0.9);
      return (a + b + c) / 3.0;
    }

    void main() {
      float t = uTime * 0.6;
      float disp = wave(position, t) * (uDisplace + uScrollPulse * 0.08);
      vDisp = disp;

      vec3 displaced = position + normal * disp;

      vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
      vWorldNormal = normalize(mat3(modelMatrix) * normal);
      vViewDir = normalize(cameraPosition - worldPos.xyz);

      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  /* ── fragment ── */ /* glsl */ `
    uniform float uTime;
    uniform vec3  uColorCore;
    uniform vec3  uColorRim;
    uniform vec3  uColorHot;
    uniform float uFresnelPower;
    uniform float uOpacity;

    varying vec3  vWorldNormal;
    varying vec3  vViewDir;
    varying float vDisp;

    void main() {
      vec3 N = normalize(vWorldNormal);
      vec3 V = normalize(vViewDir);

      // Fresnel — bright at grazing angles (the silhouette), dark head-on.
      float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), uFresnelPower);

      // Base steel body → rim glow → hot core where displacement peaks.
      vec3 col = mix(uColorCore, uColorRim, fres);
      float hot = smoothstep(0.35, 1.0, fres) * (0.6 + 0.4 * sin(uTime + vDisp * 6.0));
      col = mix(col, uColorHot, hot * 0.5);

      // A faint inner sheen tied to the displacement ridges.
      col += uColorRim * smoothstep(0.15, -0.15, vDisp) * 0.06;

      float alpha = clamp(fres * 1.15 + 0.06, 0.0, 1.0) * uOpacity;
      gl_FragColor = vec4(col, alpha);

      #include <colorspace_fragment>
    }
  `
);

extend({ FresnelMaterial: FresnelMaterialImpl });

export { FresnelMaterialImpl as FresnelMaterial };
