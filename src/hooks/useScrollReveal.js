import { useEffect } from "react";

/**
 * useScrollReveal — attaches an IntersectionObserver to all elements
 * that have the `data-scroll-reveal` attribute and adds the `revealed`
 * class when they enter the viewport.
 */
export default function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll("[data-scroll-reveal]");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}