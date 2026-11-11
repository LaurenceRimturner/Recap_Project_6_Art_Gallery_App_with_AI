import { type ReactNode, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type PageTransitionProps = {
  animate: boolean;
  children: ReactNode;
};

/** Fades its content in when it mounts; key it by route to fade on every page change. */
export default function PageTransition({
  animate,
  children,
}: PageTransitionProps) {
  const page = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!animate) return;
      gsap.from(page.current, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
        clearProps: "opacity",
      });
    },
    { scope: page }
  );

  return (
    <div className="page" ref={page}>
      {children}
    </div>
  );
}
