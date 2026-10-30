// camera.js - perspective camera, OrbitControls, reset view and keyboard controls.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createCameraRig({ canvas, onChange = () => {} }) {
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2.5;
  controls.maxDistance = 18;
  controls.minPolarAngle = 0.1;
  controls.maxPolarAngle = Math.PI * 0.49; // never go below the floor
  controls.screenSpacePanning = false;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const home = { position: new THREE.Vector3(5.2, 3.8, 7.8), target: new THREE.Vector3(0, 1, 0) };
  const minTarget = new THREE.Vector3(-3, 0, -3);
  const maxTarget = new THREE.Vector3(3, 2.6, 3);
  let distScale = 1;
  let interacted = false;
  let anim = 0;

  controls.addEventListener('start', () => {
    interacted = true;
    cancelAnimationFrame(anim);
  });

  function homePose() {
    const offset = home.position.clone().sub(home.target).multiplyScalar(distScale);
    return { position: home.target.clone().add(offset), target: home.target.clone() };
  }

  function snapHome() {
    const p = homePose();
    camera.position.copy(p.position);
    controls.target.copy(p.target);
    controls.update();
  }

  function resize(aspect) {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    distScale = aspect < 0.85 ? 1.5 : aspect < 1.2 ? 1.2 : 1;
    if (!interacted) snapHome();
  }

  function update() {
    controls.target.clamp(minTarget, maxTarget);
    return controls.update();
  }

  function reset() {
    cancelAnimationFrame(anim);
    const p = homePose();
    if (reduceMotion) {
      camera.position.copy(p.position);
      controls.target.copy(p.target);
      controls.update();
      onChange();
      return;
    }
    const fromPos = camera.position.clone();
    const fromTarget = controls.target.clone();
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 700);
      const e = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(fromPos, p.position, e);
      controls.target.lerpVectors(fromTarget, p.target, e);
      controls.update();
      onChange();
      if (t < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  function rotate(dTheta, dPhi) {
    const offset = camera.position.clone().sub(controls.target);
    const s = new THREE.Spherical().setFromVector3(offset);
    s.theta += dTheta;
    s.phi = THREE.MathUtils.clamp(s.phi + dPhi, controls.minPolarAngle, controls.maxPolarAngle);
    offset.setFromSpherical(s);
    camera.position.copy(controls.target).add(offset);
    controls.update();
    onChange();
  }

  function zoom(factor) {
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance));
    camera.position.copy(controls.target).add(offset);
    controls.update();
    onChange();
  }

  // Keyboard: arrows rotate, + and - zoom, Home or R resets.
  function onKey(e) {
    const step = 0.12;
    switch (e.key) {
      case 'ArrowLeft': rotate(-step, 0); break;
      case 'ArrowRight': rotate(step, 0); break;
      case 'ArrowUp': rotate(0, -step); break;
      case 'ArrowDown': rotate(0, step); break;
      case '+': case '=': zoom(0.88); break;
      case '-': case '_': zoom(1.14); break;
      case 'Home': case 'r': case 'R': reset(); break;
      default: return;
    }
    e.preventDefault();
  }
  canvas.addEventListener('keydown', onKey);

  function dispose() {
    cancelAnimationFrame(anim);
    canvas.removeEventListener('keydown', onKey);
    controls.dispose();
  }

  return { camera, resize, update, reset, dispose };
}
