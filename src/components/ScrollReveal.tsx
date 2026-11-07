'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    // 1. Reveal elements observer
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px 60px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => {
      revealObserver.observe(el);
    });

    // 2. Story steps observer (highlights 3D component as you scroll)
    const storySteps = document.querySelectorAll('.story-step');
    const storyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          storySteps.forEach((step) =>
            step.classList.toggle('is-active', step === entry.target)
          );
          const componentKey = (entry.target as HTMLElement).dataset.component;
          if (componentKey) {
            window.dispatchEvent(
              new CustomEvent('board-component-change', {
                detail: componentKey,
              })
            );
          }
        });
      },
      { rootMargin: '-35% 0px -35% 0px', threshold: 0 }
    );
    storySteps.forEach((step) => storyObserver.observe(step));

    return () => {
      revealObserver.disconnect();
      storyObserver.disconnect();
    };
  }, []);

  return null;
}
