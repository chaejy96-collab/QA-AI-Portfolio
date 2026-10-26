const form = document.querySelector('[data-testid="profile-form"]');
const status = document.querySelector('[data-testid="save-status"]');
const reproduceDefect = new URLSearchParams(window.location.search).get('mode') === 'reproduced';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const response = await fetch('/api/profile', { method: 'POST' });

  if (response.ok && !reproduceDefect) {
    status.textContent = 'Profile saved';
    status.dataset.state = 'success';
    return;
  }

  status.textContent = 'Unable to save profile';
  status.dataset.state = 'error';
});
