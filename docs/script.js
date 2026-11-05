const faceButtons = document.querySelectorAll('.face-button');
const boardImages = document.querySelectorAll('.board-image');

faceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const face = button.dataset.showFace;
    faceButtons.forEach((item) => item.classList.toggle('is-selected', item === button));
    boardImages.forEach((image) => image.classList.toggle('is-active', image.dataset.face === face));
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const storySteps = document.querySelectorAll('.story-step');
const storyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    storySteps.forEach((step) => step.classList.toggle('is-active', step === entry.target));
    window.dispatchEvent(new CustomEvent('board-component-change', { detail: entry.target.dataset.component }));
  });
}, { rootMargin: '-38% 0px -38% 0px', threshold: 0 });

storySteps.forEach((step) => storyObserver.observe(step));
// QUICK START: append to the end of script.js
document.querySelectorAll('.copy-button').forEach((button) => {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) return;
    const text = target.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // fallback for http:// pages or older browsers
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    const label = button.textContent;
    button.textContent = 'Copied';
    button.classList.add('is-copied');
    setTimeout(() => {
      button.textContent = label;
      button.classList.remove('is-copied');
    }, 1600);
  });
});