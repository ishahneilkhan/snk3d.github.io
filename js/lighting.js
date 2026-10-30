// lighting.js - sun, moon, lamps, environment light and the Daylight/Night presets.
// Tuning tip: change the numbers in PRESETS below to make the scene brighter or darker.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const PRESETS = {
  day: { bg: '#2a3541', exposure: 1.0, sun: 3.4, moon: 0, hemi: 0.5, env: 0.75, ceiling: 0, lamp: 0, glow: 0 },
  night: { bg: '#090d12', exposure: 1.1, sun: 0, moon: 0.3, hemi: 0.07, env: 0.12, ceiling: 22, lamp: 12, glow: 1.6 }
};
const NUM_KEYS = ['exposure', 'sun', 'moon', 'hemi', 'env', 'ceiling', 'lamp', 'glow'];

export function createLighting({ scene, renderer, mats, room, furniture, shadowSize = 2048, onChange = () => {} }) {
  // Soft image-based light from a built-in neutral room (no HDR file needed).
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;

  const sun = new THREE.DirectionalLight(0xfff1dc, 0);
  sun.position.set(3, 5, -9);
  sun.target.position.set(0, 0, 0.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  sun.shadow.camera.left = -6;
  sun.shadow.camera.right = 6;
  sun.shadow.camera.top = 6;
  sun.shadow.camera.bottom = -6;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 25;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);

  const moon = new THREE.DirectionalLight(0x8fa6ff, 0);
  moon.position.set(-3, 4, -8);
  moon.target.position.set(0, 0, 0.5);
  scene.add(moon, moon.target);

  const hemi = new THREE.HemisphereLight(0xdfe8f5, 0x3a3128, 0);
  scene.add(hemi);

  const ceilingLight = new THREE.PointLight(0xffe2b8, 0, 0, 2);
  ceilingLight.position.set(0, room.h - 0.35, 0);
  scene.add(ceilingLight);

  const fixture = mats.make({ color: '#ffffff', roughness: 0.6, emissive: '#ffd9a0', emissiveIntensity: 0 });
  const fixtureMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 32), fixture);
  fixtureMesh.position.set(0, room.h - 0.02, 0);
  scene.add(fixtureMesh);

  const glowMaterials = [fixture, ...furniture.glowMaterials];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const current = { ...PRESETS.day, bgColor: new THREE.Color(PRESETS.day.bg) };
  let raf = 0;

  function apply(c) {
    scene.background.copy(c.bgColor);
    renderer.toneMappingExposure = c.exposure;
    sun.intensity = c.sun;
    sun.visible = c.sun > 0.01;
    moon.intensity = c.moon;
    hemi.intensity = c.hemi;
    mats.setEnvIntensity(c.env);
    ceilingLight.intensity = c.ceiling;
    furniture.lampLight.intensity = c.lamp;
    glowMaterials.forEach((m) => {
      m.emissiveIntensity = c.glow;
    });
  }

  function setPreset(name, { instant = false } = {}) {
    const target = PRESETS[name];
    if (!target) return false;
    cancelAnimationFrame(raf);
    if (instant || reduceMotion) {
      NUM_KEYS.forEach((k) => {
        current[k] = target[k];
      });
      current.bgColor.set(target.bg);
      apply(current);
      onChange();
      return true;
    }
    const from = {};
    NUM_KEYS.forEach((k) => {
      from[k] = current[k];
    });
    const bgFrom = current.bgColor.clone();
    const bgTo = new THREE.Color(target.bg);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 600);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      NUM_KEYS.forEach((k) => {
        current[k] = from[k] + (target[k] - from[k]) * e;
      });
      current.bgColor.lerpColors(bgFrom, bgTo, e);
      apply(current);
      onChange();
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return true;
  }

  function dispose() {
    cancelAnimationFrame(raf);
    sun.shadow.map?.dispose();
    envTarget.dispose();
    pmrem.dispose();
    fixtureMesh.geometry.dispose();
  }

  return { setPreset, dispose };
}
