import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fades and lifts every element matching `selector` into place, one after another. */
export default function useReveal<T extends HTMLElement>(selector: string) {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(selector, {
        opacity: 0,
        y: 16,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
        clearProps: "all",
      });
    },
    { scope },
  );

  return scope;
}
