import { useCallback, useEffect, useRef } from "react";

export function useGameSound() {
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioCtx.current) {
        audioCtx.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      }
    };
    window.addEventListener("click", initAudio, { once: true });
    return () => window.removeEventListener("click", initAudio);
  }, []);

  const play = useCallback((type: "success" | "fail" | "win") => {
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "fail") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "win") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.1);
      osc.frequency.setValueAtTime(800, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  }, []);

  return { play };
}
