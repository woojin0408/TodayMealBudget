import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const previous = useRef(target);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const start = previous.current;
    const end = target;
    if (start === end) return;

    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      setDisplay(Math.round(start + (end - start) * eased));

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setDisplay(end);
        previous.current = end;
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [duration, target]);

  return display;
}
