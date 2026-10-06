"use client";

import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps<T extends ElementType> = {
  /** The element to render. Defaults to a `div`; pass `"section"`, `"li"`, etc. to keep semantics and landmarks. */
  as?: T;
  children: ReactNode;
  className?: string;
  /** Milliseconds to hold before this item animates, for staggering a row of cards. */
  delay?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/**
 * Fades its children gently up into view the first time they are scrolled near, the way modern landing pages do. It
 * reveals once and then stays, uses an IntersectionObserver, and respects reduced motion (and anything already on
 * screen or without an observer shows immediately). The content is always in the DOM, so it stays readable and
 * indexable even before it animates. Render it as any element with `as`, and stagger a row with `delay`.
 */
export function Reveal<T extends ElementType = "div">({ as, children, className, delay = 0, ...rest }: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
      className={cn(
        "ease-[cubic-bezier(.2,.75,.2,1)] transition-[opacity,transform] duration-700 will-change-[opacity,transform] motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
