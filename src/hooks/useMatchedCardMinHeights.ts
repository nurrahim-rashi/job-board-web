import { useLayoutEffect, type RefObject } from "react";

export function useMatchedCardMinHeights(
  containerRef: RefObject<HTMLElement | null>,
  leftSelector: string,
  rightSelector: string,
  enabled = true,
) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const leftCards = Array.from(
      container.querySelectorAll<HTMLElement>(leftSelector),
    );
    const rightCards = Array.from(
      container.querySelectorAll<HTMLElement>(rightSelector),
    );

    const sync = () => {
      leftCards.forEach((card, index) => {
        card.style.minHeight = "";
        if (!window.matchMedia("(min-width: 901px)").matches) return;
        const matchingRightCard = rightCards[index];
        if (matchingRightCard) {
          card.style.minHeight = `${matchingRightCard.offsetHeight}px`;
        }
      });
    };

    sync();
    const observer = new ResizeObserver(sync);
    rightCards.forEach((card) => observer.observe(card));
    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      leftCards.forEach((card) => {
        card.style.minHeight = "";
      });
    };
  }, [containerRef, enabled, leftSelector, rightSelector]);
}
