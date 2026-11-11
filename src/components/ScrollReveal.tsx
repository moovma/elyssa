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

    // 2. Story steps observer (highlights 3D component as you scroll)
    const storyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          document
            .querySelectorAll('.story-step')
            .forEach((step) => step.classList.toggle('is-active', step === entry.target));
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
      { rootMargin: window.innerWidth <= 900 ? '-52% 0px -28% 0px' : '-35% 0px -35% 0px', threshold: 0 } // phones: the pinned model covers the top of the screen
    );

    // Observe each element once. Lazily-loaded components (the 3D viewer) insert their
    // .reveal / .story-step elements after this effect runs, so we also watch the DOM.
    const seen = new WeakSet<Element>();
    const scan = (root: ParentNode) => {
      root.querySelectorAll('.reveal').forEach((el) => {
        if (seen.has(el) || el.classList.contains('is-visible')) return;
        seen.add(el);
        revealObserver.observe(el);
      });
      root.querySelectorAll('.story-step').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        storyObserver.observe(el);
      });
    };
    scan(document);

    const mutationObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const el = node as Element;
          if (el.matches('.reveal') && !seen.has(el)) {
            seen.add(el);
            revealObserver.observe(el);
          }
          if (el.matches('.story-step') && !seen.has(el)) {
            seen.add(el);
            storyObserver.observe(el);
          }
          scan(el);
        });
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      revealObserver.disconnect();
      storyObserver.disconnect();
    };
  }, []);

  return null;
}
