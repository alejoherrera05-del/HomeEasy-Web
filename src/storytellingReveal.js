const REVEAL_SELECTORS = [
  ".recommender-heading",
  ".catalog-entry-heading",
  ".wallpaper-heading",
  ".wallpaper-comparison",
  ".process-v5-intro",
  ".process-v5-stories article",
  ".contact-v4-heading",
  ".contact-v4-directory",
];

export function initStorytellingReveals() {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const targets = Array.from(document.querySelectorAll(REVEAL_SELECTORS.join(",")));
  if (!targets.length) return () => {};

  targets.forEach((element) => {
    element.classList.add("story-reveal");
    if (element.matches(".wallpaper-comparison")) {
      element.classList.add("story-image-reveal");
    }
  });

  document.documentElement.classList.add("storytelling-ready");

  if (reducedMotion || typeof window.IntersectionObserver !== "function") {
    targets.forEach((element) => element.classList.add("is-story-visible"));
    return () => document.documentElement.classList.remove("storytelling-ready");
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-story-visible");
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -6%",
    threshold: 0.04,
  });

  targets.forEach((element) => observer.observe(element));

  return () => {
    observer.disconnect();
    document.documentElement.classList.remove("storytelling-ready");
  };
}
