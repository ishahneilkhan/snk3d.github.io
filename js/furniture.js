// furniture.js - simple furniture built from basic shapes (no external models).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const FURNITURE_ITEMS = [
  { id: 'sofa', label: 'Sofa' },
  { id: 'table', label: 'Coffee table' },
  { id: 'rug', label: 'Rug' },
  { id: 'lamp', label: 'Floor lamp' },
  { id: 'plant', label: 'Plant' },
  { id: 'shelf', label: 'Shelving' }
];

export function createFurniture(mats) {
  const fabric = mats.make({ color: '#7d8a96', roughness: 0.95 });
  const wood = mats.make({ color: '#8a6a4b', roughness: 0.6 });
  const brass = mats.make({ color: '#D7B77B', roughness: 0.35, metalness: 0.9 });
  const rugMat = mats.make({ color: '#c9bfae', roughness: 1 });
  const pot = mats.make({ color: '#e8e2d6', roughness: 0.7 });
  const leaf = mats.make({ color: '#4c7a4f', roughness: 0.8 });
  const shade = mats.make({
    color: '#f3e6c9', roughness: 0.9, emissive: '#ffc878', emissiveIntensity: 0, side: THREE.DoubleSide
  });
  const bookColors = ['#8c3b2f', '#2f4858', '#c9a24b', '#5b6b4e', '#d9d2c3', '#40454f'].map((c) =>
    mats.make({ color: c, roughness: 0.8 })
  );

  const add = (parent, geo, mat, x, y, z, cast = true) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const soft = (w, h, d, r = 0.05) => new RoundedBoxGeometry(w, h, d, 3, r);

  const root = new THREE.Group();
  root.name = 'furniture';
  const groups = {};
  const makeGroup = (id, x, y, z) => {
    const g = new THREE.Group();
    g.name = id;
    g.position.set(x, y, z);
    groups[id] = g;
    root.add(g);
    return g;
  };

  // Sofa (faces +z, back panel at -z)
  const sofa = makeGroup('sofa', -0.8, 0, -1.95);
  add(sofa, soft(2.2, 0.35, 0.95), fabric, 0, 0.3, 0);
  add(sofa, soft(2.2, 0.5, 0.22), fabric, 0, 0.62, -0.36);
  add(sofa, soft(0.2, 0.56, 0.95), fabric, -1.0, 0.4, 0);
  add(sofa, soft(0.2, 0.56, 0.95), fabric, 1.0, 0.4, 0);
  [-0.46, 0.46].forEach((x) => {
    add(sofa, soft(0.9, 0.14, 0.75), fabric, x, 0.54, 0.08);
    const back = add(sofa, soft(0.9, 0.38, 0.14), fabric, x, 0.72, -0.2);
    back.rotation.x = -0.18;
  });
  [[-0.95, -0.4], [0.95, -0.4], [-0.95, 0.4], [0.95, 0.4]].forEach(([x, z]) =>
    add(sofa, new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12), wood, x, 0.06, z)
  );

  // Coffee table
  const table = makeGroup('table', -0.8, 0, -0.6);
  add(table, soft(1.1, 0.05, 0.6, 0.02), wood, 0, 0.42, 0);
  [[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]].forEach(([x, z]) =>
    add(table, new THREE.CylinderGeometry(0.022, 0.022, 0.4, 12), brass, x, 0.2, z)
  );

  // Rug
  const rug = makeGroup('rug', -0.8, 0, -0.9);
  add(rug, new THREE.BoxGeometry(2.8, 0.02, 1.9), rugMat, 0, 0.011, 0, false);

  // Floor lamp with a warm light (the light is switched by lighting.js)
  const lamp = makeGroup('lamp', -2.45, 0, -2.05);
  add(lamp, new THREE.CylinderGeometry(0.15, 0.17, 0.03, 24), brass, 0, 0.015, 0);
  add(lamp, new THREE.CylinderGeometry(0.014, 0.014, 1.55, 12), brass, 0, 0.8, 0);
  add(lamp, new THREE.CylinderGeometry(0.17, 0.26, 0.32, 24, 1, true), shade, 0, 1.64, 0, false);
  const lampLight = new THREE.PointLight(0xffcf94, 0, 0, 2);
  lampLight.position.set(0, 1.55, 0);
  lamp.add(lampLight);

  // Plant
  const plant = makeGroup('plant', 2.4, 0, -2.0);
  add(plant, new THREE.CylinderGeometry(0.22, 0.17, 0.35, 20), pot, 0, 0.175, 0);
  const leafGeo = new THREE.IcosahedronGeometry(0.2, 0);
  [[0, 0.75, 0, 1], [0.15, 0.6, 0.08, 0.8], [-0.14, 0.65, -0.05, 0.85], [0.05, 0.9, -0.1, 0.7],
   [-0.08, 0.5, 0.14, 0.75], [0.18, 0.8, -0.1, 0.65], [-0.2, 0.85, 0.05, 0.6]].forEach(([x, y, z, s], i) => {
    const m = add(plant, leafGeo, leaf, x, y, z);
    m.scale.set(s, s * 1.7, s * 0.7);
    m.rotation.set(i * 0.5, i * 1.1, i * 0.3);
  });

  // Shelving against the right wall (faces -x after rotation)
  const shelf = makeGroup('shelf', 2.82, 0, 0.6);
  shelf.rotation.y = -Math.PI / 2;
  add(shelf, new THREE.BoxGeometry(0.03, 1.8, 0.32), wood, -0.5, 0.9, 0);
  add(shelf, new THREE.BoxGeometry(0.03, 1.8, 0.32), wood, 0.5, 0.9, 0);
  add(shelf, new THREE.BoxGeometry(1.0, 1.8, 0.01), wood, 0, 0.9, -0.15);
  [0.04, 0.5, 0.95, 1.4, 1.78].forEach((y) => add(shelf, new THREE.BoxGeometry(1.0, 0.03, 0.32), wood, 0, y, 0));
  [0.5, 0.95, 1.4].forEach((y, row) => {
    let x = -0.44;
    for (let i = 0; i < 7; i++) {
      const w = 0.05 + ((i * 3 + row * 5) % 4) * 0.012;
      const h = 0.2 + ((i * 7 + row * 3) % 5) * 0.025;
      add(shelf, new THREE.BoxGeometry(w, h, 0.2), bookColors[(i + row) % bookColors.length], x + w / 2, y + 0.015 + h / 2, 0);
      x += w + 0.01;
      if (x > 0.35) break;
    }
  });

  return { root, groups, lampLight, glowMaterials: [shade] };
}
