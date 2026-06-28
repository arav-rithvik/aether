"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Ctx, runsFor, TOTAL_VERSIONS } from "./useAether";
import { ModelId, Run } from "./schema";

const VERSION_DWELL = 2800; // ms the autoplay rests on each version
const FEED_INTERVAL = 110; // ms between streamed runs
const FEED_MAX = 36;

export function AetherProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersionRaw] = useState(1);
  const [model, setModel] = useState<ModelId>("gpt");
  const [playing, setPlaying] = useState(false);
  const [feed, setFeed] = useState<Run[]>([]);

  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setVersion = useCallback((v: number) => {
    setPlaying(false);
    setVersionRaw(v);
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setVersionRaw(1);
  }, []);

  const play = useCallback(() => {
    setVersionRaw(1);
    setPlaying(true);
  }, []);

  // autoplay: walk versions 1 → TOTAL_VERSIONS, then stop
  useEffect(() => {
    if (!playing) return;
    if (version >= TOTAL_VERSIONS) {
      setPlaying(false);
      return;
    }
    playTimer.current = setTimeout(() => setVersionRaw((v) => v + 1), VERSION_DWELL);
    return () => {
      if (playTimer.current) clearTimeout(playTimer.current);
    };
  }, [playing, version]);

  // live feed: stream the selected cell's runs in, newest first
  useEffect(() => {
    const cell = runsFor(model, version);
    setFeed([]);
    let i = 0;
    const id = setInterval(() => {
      if (i >= cell.length) {
        clearInterval(id);
        return;
      }
      const r = cell[i++];
      setFeed((prev) => [r, ...prev].slice(0, FEED_MAX));
    }, FEED_INTERVAL);
    return () => clearInterval(id);
  }, [model, version]);

  return (
    <Ctx.Provider
      value={{ version, setVersion, model, setModel, playing, play, reset, feed }}
    >
      {children}
    </Ctx.Provider>
  );
}
