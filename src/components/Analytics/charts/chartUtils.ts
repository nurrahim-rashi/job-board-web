import { useEffect, useRef, useState } from "react";
export const seriesColors = ["#485eb4", "#eb6834", "#1baf7a", "#eda100"];

export const ordinalRamp = [
  "#a9b4de",
  "#8f9cd4",
  "#7686c9",
  "#5d70bd",
  "#4a5da8",
  "#38487e",
];

export const chartInk = {
  surface: "#fffdf7",
  grid: "#ece7dd",
  axis: "#d5cfc3",
  muted: "#74717a",
};

export const rampColor = (index: number, total: number) => {
  if (total <= 1) return ordinalRamp[ordinalRamp.length - 2];
  const step = (ordinalRamp.length - 1) * (index / (total - 1));

  return ordinalRamp[Math.round(step)];
};

const STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

const niceStep = (rough: number) => {
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const step = STEPS.find((candidate) => normalized <= candidate) ?? 10;

  return step * magnitude;
};

export function buildScale(maxValue: number, count = 4) {
  const step = niceStep(Math.max(maxValue, 1) / count);
  const max = step * count;

  return {
    max,
    ticks: Array.from({ length: count + 1 }, (_, index) => step * index),
  };
}

export function useChartWidth(fallback = 640) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const measured = Math.round(entries[0].contentRect.width);
      if (measured > 0) setWidth(measured);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
