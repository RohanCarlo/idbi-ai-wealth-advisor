"use client";

import { useEffect, useState } from "react";

interface Props {
  speaking?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { outer: 40, inner: 32, ring: 44 },
  md: { outer: 64, inner: 52, ring: 72 },
  lg: { outer: 96, inner: 78, ring: 108 },
};

export default function AryaAvatar({ speaking = false, size = "md" }: Props) {
  const [blink, setBlink] = useState(false);
  const [wave, setWave] = useState(0);
  const s = SIZES[size];

  // Blink every ~4 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Speaking wave animation
  useEffect(() => {
    if (!speaking) { setWave(0); return; }
    const t = setInterval(() => setWave((w) => (w + 1) % 4), 200);
    return () => clearInterval(t);
  }, [speaking]);

  const eyeHeight = blink ? 1 : 5;

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0"
      style={{ width: s.ring, height: s.ring }}>
      {/* Pulse ring when speaking */}
      {speaking && (
        <div className="absolute inset-0 rounded-full border-2 border-brand-400 animate-ping opacity-30" />
      )}
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #00836c, #f58220, #00836c)",
          animation: "spin 4s linear infinite",
          padding: 2,
        }}
      >
        <div className="w-full h-full rounded-full bg-white" />
      </div>

      {/* Avatar face */}
      <div
        className="relative rounded-full flex items-center justify-center overflow-hidden"
        style={{
          width: s.outer,
          height: s.outer,
          background: "linear-gradient(135deg, #00836c 0%, #00735f 50%, #f58220 100%)",
          zIndex: 1,
        }}
      >
        <svg width={s.inner} height={s.inner} viewBox="0 0 52 52" fill="none">
          {/* Face shine */}
          <ellipse cx="20" cy="14" rx="8" ry="5" fill="white" opacity="0.15" />

          {/* Eyes */}
          <ellipse cx="19" cy="22" rx="4" ry={eyeHeight} fill="white" opacity="0.95" />
          <ellipse cx="33" cy="22" rx="4" ry={eyeHeight} fill="white" opacity="0.95" />
          {/* Pupils */}
          {!blink && (
            <>
              <ellipse cx="20" cy="23" rx="2" ry="2.5" fill="#00372d" />
              <ellipse cx="34" cy="23" rx="2" ry="2.5" fill="#00372d" />
              {/* Pupil shine */}
              <circle cx="21" cy="22" r="0.8" fill="white" />
              <circle cx="35" cy="22" r="0.8" fill="white" />
            </>
          )}

          {/* Smile / speaking mouth */}
          {speaking ? (
            <ellipse cx="26" cy="35" rx={4 + wave} ry={2 + (wave % 2)} fill="white" opacity="0.9" />
          ) : (
            <path d="M19 34 Q26 40 33 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
          )}

          {/* Sparkle dots */}
          <circle cx="8" cy="10" r="1.5" fill="white" opacity="0.5" />
          <circle cx="44" cy="8" r="1" fill="white" opacity="0.4" />
          <circle cx="46" cy="40" r="1.5" fill="white" opacity="0.3" />
        </svg>

        {/* AI chip on forehead */}
        <div className="absolute top-1 right-1 w-3 h-3 rounded-sm bg-accent-300 opacity-80 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-accent-700" />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
