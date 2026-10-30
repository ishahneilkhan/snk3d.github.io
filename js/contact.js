// contact.js - inquiry form validation and honest submission feedback.
// The form only says "sent" when a real service accepted it. To connect a service,
// set data-endpoint on the <form> in contact.html (see README).
const RULES = {
  name: (v) => (v.trim().length >= 2 ? '' : 'Enter your name.'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address, like name@example.com.'),
  type: (v) => (v ? '' : 'Choose a project type.'),
  message: (v) => (v.trim().length >= 20 ? '' : 'Tell us a little more. Use at least 20 characters.')
};

export function initContactForm() {
  const form = document.getElementById('inquiry-form');
  const status = document.getElementById('form-status');
  const button = form.querySelector('button[type="submit"]');
  const endpoint = (form.dataset.endpoint || '').trim();

  const setStatus = (kind, text) => {
    status.className = `form-status is-${kind}`;
    status.textContent = text;
  };

  function check(name) {
    const field = form.elements[name];
    const error = document.getElementById(`err-${name}`);
    const message = RULES[name](field.value);
    error.textContent = message;
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  }

  Object.keys(RULES).forEach((name) => {
    form.elements[name].addEventListener('blur', () => check(name));
    form.elements[name].addEventListener('input', () => {
      if (form.elements[name].getAttribute('aria-invalid') === 'true') check(name);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    const results = Object.keys(RULES).map((name) => [name, check(name)]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) {
      setStatus('error', 'Check the fields marked in red and try again.');
      form.elements[firstBad[0]].focus();
      return;
    }
    if (form.elements.company.value) return; // hidden spam trap: real people leave it empty

    if (!endpoint) {
      setStatus('warn', "This form isn't connected to an email or form service yet, so your message was not sent. The site owner can connect it by following the README.");
      return;
    }

    button.disabled = true;
    setStatus('warn', 'Sending…');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      setStatus('ok', 'Thanks. Your inquiry was sent.');
    } catch (err) {
      console.error('Inquiry failed:', err);
      setStatus('error', 'Your inquiry could not be sent. Check your connection and try again.');
    } finally {
      button.disabled = false;
    }
  });
}
