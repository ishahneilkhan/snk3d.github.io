// scene.js - builds the room, starts the renderer and returns a small API for the UI.
import * as THREE from 'three';
import { createMaterials } from './materials.js';
import { createFurniture } from './furniture.js';
import { createLighting } from './lighting.js';
import { createCameraRig } from './camera.js';

const ROOM = { w: 6, d: 5, h: 2.8 }; // metres: x = width, z = depth, y = height

// A wall is a single-sided shape that faces into the room. From outside it is
// invisible (back-face culling), which gives the "dollhouse" cutaway view.
function wallGeometry(width, height, opening) {
  const hw = width / 2;
  const s = new THREE.Shape();
  if (opening && opening.type === 'door') {
    const x0 = opening.x - opening.w / 2;
    const x1 = opening.x + opening.w / 2;
    s.moveTo(-hw, 0);
    s.lineTo(x0, 0);
    s.lineTo(x0, opening.h);
    s.lineTo(x1, opening.h);
    s.lineTo(x1, 0);
    s.lineTo(hw, 0);
    s.lineTo(hw, height);
    s.lineTo(-hw, height);
  } else {
    s.moveTo(-hw, 0);
    s.lineTo(hw, 0);
    s.lineTo(hw, height);
    s.lineTo(-hw, height);
    if (opening && opening.type === 'window') {
      const x0 = opening.x - opening.w / 2;
      const x1 = opening.x + opening.w / 2;
      const hole = new THREE.Path();
      hole.moveTo(x0, opening.y0);
      hole.lineTo(x0, opening.y1);
      hole.lineTo(x1, opening.y1);
      hole.lineTo(x1, opening.y0);
      s.holes.push(hole);
    }
  }
  return new THREE.ShapeGeometry(s);
}

function buildRoom(scene, mats) {
  const { w, d, h } = ROOM;
  const group = new THREE.Group();
  group.name = 'room';

  const mesh = (geo, mat, x, y, z, cast = false) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
  const box = (bw, bh, bd, mat, x, y, z) => mesh(new THREE.BoxGeometry(bw, bh, bd), mat, x, y, z, true);

  // Floor and ceiling
  const floor = mesh(new THREE.PlaneGeometry(w, d), mats.floor, 0, 0, 0);
  floor.rotation.x = -Math.PI / 2;
  const ceiling = mesh(new THREE.PlaneGeometry(w, d), mats.ceiling, 0, h, 0);
  ceiling.rotation.x = Math.PI / 2;

  // Back wall with the window (window centre x = 1.0, from 0.9 m to 2.3 m high)
  const win = { type: 'window', x: 1.0, w: 1.8, y0: 0.9, y1: 2.3 };
  mesh(wallGeometry(w, h, win), mats.wall, 0, 0, -d / 2, true);
  // Front wall (no opening), right wall (no opening)
  const front = mesh(wallGeometry(w, h), mats.wall, 0, 0, d / 2, true);
  front.rotation.y = Math.PI;
  const right = mesh(wallGeometry(d, h), mats.wall, w / 2, 0, 0, true);
  right.rotation.y = -Math.PI / 2;
  // Left wall with the door. Local x runs along world -z, so local 1.2 = world z -1.2.
  const door = { type: 'door', x: 1.2, w: 0.95, h: 2.1 };
  const left = mesh(wallGeometry(d, h, door), mats.wall, -w / 2, 0, 0, true);
  left.rotation.y = Math.PI / 2;

  // Window frame, mullions, sill and glass
  const frameZ = -d / 2 + 0.04;
  box(1.9, 0.06, 0.1, mats.trim, 1.0, 2.3, frameZ);
  box(1.9, 0.06, 0.1, mats.trim, 1.0, 0.9, frameZ);
  box(0.06, 1.46, 0.1, mats.trim, 0.1, 1.6, frameZ);
  box(0.06, 1.46, 0.1, mats.trim, 1.9, 1.6, frameZ);
  box(0.04, 1.4, 0.06, mats.trim, 1.0, 1.6, frameZ);
  box(1.8, 0.04, 0.06, mats.trim, 1.0, 1.6, frameZ);
  box(2.0, 0.04, 0.18, mats.trim, 1.0, 0.88, -d / 2 + 0.09);
  const glass = mats.make({ color: '#cfe6ff', roughness: 0.05, transparent: true, opacity: 0.12 });
  glass.depthWrite = false;
  mesh(new THREE.PlaneGeometry(1.8, 1.4), glass, 1.0, 1.6, -d / 2 + 0.01);

  // Door leaf, frame and handle
  const doorWood = mats.make({ color: '#6b4f38', roughness: 0.6 });
  const brass = mats.make({ color: '#D7B77B', roughness: 0.35, metalness: 0.9 });
  const doorZ = -1.2;
  box(0.05, 2.1, 0.95, doorWood, -w / 2 + 0.03, 1.05, doorZ);
  box(0.06, 2.16, 0.05, mats.trim, -w / 2 + 0.04, 1.08, doorZ - 0.5);
  box(0.06, 2.16, 0.05, mats.trim, -w / 2 + 0.04, 1.08, doorZ + 0.5);
  box(0.06, 0.05, 1.05, mats.trim, -w / 2 + 0.04, 2.13, doorZ);
  const handle = mesh(new THREE.SphereGeometry(0.035, 16, 12), brass, -w / 2 + 0.09, 1.0, doorZ + 0.36, true);
  handle.receiveShadow = false;

  // Skirting boards (the left wall is split around the door)
  box(w, 0.1, 0.02, mats.trim, 0, 0.05, -d / 2 + 0.01);
  box(w, 0.1, 0.02, mats.trim, 0, 0.05, d / 2 - 0.01);
  box(0.02, 0.1, d, mats.trim, w / 2 - 0.01, 0.05, 0);
  box(0.02, 0.1, 0.825, mats.trim, -w / 2 + 0.01, 0.05, -2.0875);
  box(0.02, 0.1, 3.225, mats.trim, -w / 2 + 0.01, 0.05, 0.8875);

  scene.add(group);
  return group;
}

export function createStudio({ canvas, container, onContextLost = () => {}, onContextRestored = () => {} }) {
  const coarse = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 700;

  // This line throws if WebGL is not available; main.js shows a friendly message.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#2a3541');

  let needsRender = true;
  let running = true;
  let raf = 0;
  let firstFrame = false;
  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });
  const requestRender = () => {
    needsRender = true;
  };

  const mats = createMaterials({ maxAnisotropy: Math.min(renderer.capabilities.getMaxAnisotropy(), coarse ? 4 : 8) });
  mats.setFloor('oak');
  buildRoom(scene, mats);
  const furniture = createFurniture(mats);
  scene.add(furniture.root);
  const lighting = createLighting({
    scene, renderer, mats, room: ROOM, furniture, shadowSize: coarse ? 1024 : 2048, onChange: requestRender
  });
  lighting.setPreset('day', { instant: true });
  const rig = createCameraRig({ canvas, onChange: requestRender });

  function resize() {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false);
    rig.resize(width / height);
    requestRender();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  function frame() {
    raf = requestAnimationFrame(frame);
    const moved = rig.update();
    if (moved || needsRender) {
      needsRender = false;
      renderer.render(scene, rig.camera);
      if (!firstFrame) {
        firstFrame = true;
        resolveReady();
      }
    }
  }
  raf = requestAnimationFrame(frame);

  // Pause rendering while the studio is scrolled out of view (saves battery on phones).
  const visibility = new IntersectionObserver((entries) => {
    const visible = entries[0].isIntersecting;
    if (visible && !running) {
      running = true;
      needsRender = true;
      raf = requestAnimationFrame(frame);
    } else if (!visible && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  });
  visibility.observe(container);

  const lost = (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    running = false;
    onContextLost();
  };
  const restored = () => {
    running = true;
    needsRender = true;
    raf = requestAnimationFrame(frame);
    onContextRestored();
  };
  canvas.addEventListener('webglcontextlost', lost);
  canvas.addEventListener('webglcontextrestored', restored);

  function dispose() {
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    visibility.disconnect();
    canvas.removeEventListener('webglcontextlost', lost);
    canvas.removeEventListener('webglcontextrestored', restored);
    rig.dispose();
    lighting.dispose();
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
    });
    mats.dispose();
    renderer.dispose();
  }

  return {
    ready,
    setWallColor(hex) { mats.setWallColor(hex); requestRender(); },
    setFloor(id) { const ok = mats.setFloor(id); requestRender(); return ok; },
    setLighting(name) { return lighting.setPreset(name); },
    setFurnitureVisible(id, visible) {
      const g = furniture.groups[id];
      if (!g) return false;
      g.visible = visible;
      requestRender();
      return true;
    },
    resetCamera() { rig.reset(); },
    dispose
  };
}
