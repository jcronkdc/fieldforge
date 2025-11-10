export function pauseOffscreen(selector = '[data-anim]'): void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return;
  }

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const animatedElements = document.querySelectorAll<HTMLElement>(selector);

  if (prefersReducedMotion) {
    animatedElements.forEach((element) => {
      element.style.animationPlayState = 'paused';
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        element.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      }
    },
    { rootMargin: '0px 0px 200px 0px', threshold: 0.01 }
  );

  animatedElements.forEach((element) => {
    io.observe(element);
  });
}

