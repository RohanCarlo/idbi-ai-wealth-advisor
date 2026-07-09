"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const options = [
    { key: "light", icon: Sun },
    { key: "dark", icon: Moon },
    { key: "system", icon: Monitor },
  ] as const;

  return (
    <div className="flex items-center gap-0.5 bg-outline-2 rounded-xl p-1 border border-outline">
      {options.map(({ key, icon: Icon }) => (
        <button key={key} onClick={() => setTheme(key)}
          title={key}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 ${
            theme === key
              ? "bg-brand-600 text-white shadow-sm"
              : "text-content-3 hover:text-content hover:bg-outline"
          }`}>
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}
