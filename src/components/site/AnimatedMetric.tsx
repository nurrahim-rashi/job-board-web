import { useEffect, useRef, useState } from "react";

export function AnimatedMetric({ value, suffix = "" }: { value: number; suffix?: string }) {
  const elementRef = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    let animationFrame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const startedAt = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / 850, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(value * eased));
        if (progress < 1) animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  return <strong ref={elementRef}>{display}{suffix}</strong>;
}
