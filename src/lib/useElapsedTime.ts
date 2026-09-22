"use client";

import { useEffect, useState } from "react";

export function useElapsedTime(createdAt: string) {
  const [label, setLabel] = useState("0:00");

  useEffect(() => {
    const start = new Date(createdAt).getTime();

    function tick() {
      const diff = Math.max(0, Date.now() - start);
      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setLabel(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return label;
}
