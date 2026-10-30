// controls.js - connects the buttons and checkboxes on the page to the 3D studio.
import { WALL_COLORS, FLOORS } from './materials.js';
import { FURNITURE_ITEMS } from './furniture.js';

const LIGHTS = [
  { id: 'day', label: 'Daylight' },
  { id: 'night', label: 'Night' }
];

// Builds a row of toggle buttons where exactly one is pressed at a time.
function choiceButtons(host, items, initialId, className, label, onPick) {
  items.forEach((item) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.dataset.id = item.id;
    b.setAttribute('aria-pressed', String(item.id === initialId));
    if (className === 'swatch') {
      b.style.background = item.hex;
      b.setAttribute('aria-label', item.label);
      b.title = item.label;
    } else {
      b.textContent = item.label;
    }
    b.addEventListener('click', () => {
      host.querySelectorAll('button').forEach((o) => o.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      onPick(item);
    });
    host.appendChild(b);
  });
}

export function bindControls(studio, { container }) {
  const live = document.getElementById('studio-live');
  const say = (text) => {
    if (live) live.textContent = text;
  };

  choiceButtons(document.getElementById('wall-options'), WALL_COLORS, 'warm-white', 'swatch', 'Wall colour', (item) => {
    studio.setWallColor(item.hex);
    say(`Wall colour: ${item.label}`);
  });
  choiceButtons(document.getElementById('floor-options'), FLOORS, 'oak', 'chip', 'Floor', (item) => {
    studio.setFloor(item.id);
    say(`Floor: ${item.label}`);
  });
  choiceButtons(document.getElementById('light-options'), LIGHTS, 'day', 'chip', 'Light', (item) => {
    studio.setLighting(item.id);
    say(`Lighting: ${item.label}`);
  });

  const furnHost = document.getElementById('furniture-options');
  FURNITURE_ITEMS.forEach((item) => {
    const label = document.createElement('label');
    label.className = 'check';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    input.addEventListener('change', () => {
      studio.setFurnitureVisible(item.id, input.checked);
      say(`${item.label} ${input.checked ? 'shown' : 'hidden'}`);
    });
    label.append(input, document.createTextNode(item.label));
    furnHost.appendChild(label);
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    studio.resetCamera();
    say('Camera reset');
  });

  // Fullscreen only appears where the browser supports it (iPhone Safari does not).
  const fsButton = document.getElementById('btn-fullscreen');
  if (document.fullscreenEnabled && container.requestFullscreen) {
    fsButton.hidden = false;
    fsButton.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen().catch(() => say('Fullscreen is not available right now.'));
      }
    });
    document.addEventListener('fullscreenchange', () => {
      fsButton.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
    });
  }

  document.getElementById('studio-controls').classList.add('is-ready');
}
