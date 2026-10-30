// materials.js - all surface materials. Textures are painted with canvas code,
// so the project needs no downloaded image files (and no texture licences).
import * as THREE from 'three';

export const WALL_COLORS = [
  { id: 'warm-white', label: 'Warm white', hex: '#F2EEE6' },
  { id: 'sage', label: 'Soft sage', hex: '#B9C4B0' },
  { id: 'clay', label: 'Clay', hex: '#C9A58C' },
  { id: 'slate-blue', label: 'Slate blue', hex: '#8FA3B5' },
  { id: 'charcoal', label: 'Charcoal', hex: '#3A444E' },
  { id: 'champagne', label: 'Champagne', hex: '#D9C7A3' }
];

export const FLOORS = [
  { id: 'oak', label: 'Oak' },
  { id: 'walnut', label: 'Walnut' },
  { id: 'concrete', label: 'Concrete' },
  { id: 'marble', label: 'Marble' }
];

// Small seeded random generator so textures look the same on every load.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return c;
}

function paintWood(size, hue, sat, light) {
  const c = makeCanvas(size);
  const g = c.getContext('2d');
  const rand = rng(hue * 7 + light);
  const boards = 8;
  const bw = size / boards;
  for (let i = 0; i < boards; i++) {
    const l = light + (rand() - 0.5) * 8;
    g.fillStyle = `hsl(${hue} ${sat}% ${l}%)`;
    g.fillRect(i * bw, 0, bw, size);
    for (let k = 0; k < 60; k++) {
      const x = i * bw + rand() * bw;
      g.strokeStyle = `hsl(${hue} ${sat}% ${l - 10}% / ${0.08 + rand() * 0.12})`;
      g.lineWidth = 0.5 + rand() * 1.2;
      g.beginPath();
      g.moveTo(x, 0);
      g.bezierCurveTo(x + (rand() - 0.5) * 6, size * 0.33, x + (rand() - 0.5) * 6, size * 0.66, x + (rand() - 0.5) * 4, size);
      g.stroke();
    }
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.fillRect(i * bw, 0, 1.5, size);
    g.fillRect(i * bw, rand() * size, bw, 1.5);
  }
  return c;
}

function paintConcrete(size) {
  const c = makeCanvas(size);
  const g = c.getContext('2d');
  const rand = rng(11);
  g.fillStyle = '#8a8d90';
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 14; i++) {
    const x = rand() * size, y = rand() * size, r = 40 + rand() * 90;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    const v = rand() > 0.5 ? '255,255,255' : '0,0,0';
    grad.addColorStop(0, `rgba(${v},0.07)`);
    grad.addColorStop(1, `rgba(${v},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
    g.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2);
  }
  return c;
}

function paintMarble(size) {
  const c = makeCanvas(size);
  const g = c.getContext('2d');
  const rand = rng(23);
  g.fillStyle = '#ecebe8';
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 16; i++) {
    let x = rand() * size, y = rand() * size;
    g.strokeStyle = `rgba(90,95,105,${0.12 + rand() * 0.22})`;
    g.lineWidth = 0.6 + rand() * 1.8;
    g.beginPath();
    g.moveTo(x, y);
    for (let s = 0; s < 22; s++) {
      x += (rand() - 0.35) * 40;
      y += (rand() - 0.35) * 40;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  return c;
}

function paintPlaster(size) {
  const c = makeCanvas(size);
  const g = c.getContext('2d');
  const rand = rng(5);
  g.fillStyle = '#f4f4f4';
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.05)';
    g.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2);
  }
  return c;
}

function toTexture(canvas, repeatX, repeatY, anisotropy) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.anisotropy = anisotropy;
  return t;
}

export function createMaterials({ maxAnisotropy = 4 } = {}) {
  const registry = new Set();
  const textures = new Map();

  // Every material is created here so lighting can adjust all of them together.
  const make = (params) => {
    const m = new THREE.MeshStandardMaterial(params);
    registry.add(m);
    return m;
  };

  const floorSpecs = {
    oak: { paint: () => paintWood(512, 32, 48, 52), rough: 0.55 },
    walnut: { paint: () => paintWood(512, 24, 38, 27), rough: 0.5 },
    concrete: { paint: () => paintConcrete(512), rough: 0.88 },
    marble: { paint: () => paintMarble(512), rough: 0.22 }
  };

  const plasterTexture = toTexture(paintPlaster(256), 0.5, 0.5, maxAnisotropy);
  const wall = make({ color: '#F2EEE6', map: plasterTexture, roughness: 0.92 });
  const ceiling = make({ color: '#f5f3ee', map: plasterTexture, roughness: 0.95 });
  const trim = make({ color: '#f1efe9', roughness: 0.5 });
  const floor = make({ color: 0xffffff, roughness: 0.55 });

  function setFloor(id) {
    const spec = floorSpecs[id];
    if (!spec) return false;
    let tex = textures.get(id);
    if (!tex) {
      tex = toTexture(spec.paint(), 3, 2.5, maxAnisotropy);
      textures.set(id, tex);
    }
    floor.map = tex;
    floor.roughness = spec.rough;
    floor.needsUpdate = true;
    return true;
  }

  function setWallColor(hex) {
    wall.color.set(hex);
  }

  function setEnvIntensity(value) {
    registry.forEach((m) => {
      m.envMapIntensity = value;
    });
  }

  function dispose() {
    registry.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    plasterTexture.dispose();
  }

  return { make, wall, ceiling, trim, floor, setFloor, setWallColor, setEnvIntensity, dispose };
}
