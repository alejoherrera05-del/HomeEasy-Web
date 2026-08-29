import { useEffect } from "react";

const REVEAL_SELECTORS = [
  ".recommender-heading",
  ".recommender-card",
  ".catalog-entry-heading",
  ".product-stage",
  ".wallpaper-heading",
  ".wallpaper-comparison",
  ".process-v5-intro",
  ".process-v5-visual",
  ".process-v5-stories article",
  ".process-v5-closing",
  ".contact-v4-heading",
  ".contact-v4-location",
  ".contact-v4-channels",
].join(",");

export function ExperienceRevealController() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const nodes = [...document.querySelectorAll(REVEAL_SELECTORS)];

    if (!nodes.length || reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-experience-visible"));
      return undefined;
    }

    nodes.forEach((node, index) => {
      node.classList.add("experience-reveal");
      node.style.setProperty("--reveal-order", String(index % 3));
    });

    root.classList.add("experience-reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-experience-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      root.classList.remove("experience-reveal-ready");
      nodes.forEach((node) => {
        node.classList.remove("experience-reveal", "is-experience-visible");
        node.style.removeProperty("--reveal-order");
      });
    };
  }, []);

  return null;
}
