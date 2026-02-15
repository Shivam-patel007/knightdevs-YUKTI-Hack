"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

/**
 * Renders a gradient blob that smoothly follows the mouse using GSAP.
 * Add to layout for app-wide effect. Does not block pointer events.
 */
export function MouseFollowEffect() {
  const blobRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const blob = blobRef.current;
    if (!blob) return;

    const xTo = gsap.quickTo(blob, "x", { duration: 0.5, ease: "power2.out" });
    const yTo = gsap.quickTo(blob, "y", { duration: 0.5, ease: "power2.out" });

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    gsap.set(blob, { x: centerX, y: centerY, xPercent: -50, yPercent: -50 });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={blobRef}
      className="pointer-events-none fixed left-0 top-0 z-[1] h-[400px] w-[400px] rounded-full blur-[80px] will-change-transform"
      style={{
        background:
          "radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(56,189,248,0.35) 45%, transparent 70%)",
        opacity: 0.85,
      }}
      aria-hidden
    />
  );
}
