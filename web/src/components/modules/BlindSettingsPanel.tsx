import { useEffect, useState } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { useStore } from "../../store";
import type { BlindAffect } from "../../modules/BlindAffect";
import type { DrawEngine } from "../../kernel/DrawEngine";

export const BlindSettingsPanel = () => {
  const { engine } = useStore();
  const [autoRedraw, setAutoRedraw] = useState(true);

  useEffect(() => {
    if (!engine) return;
    const e = engine as DrawEngine;
    const blindModule = e.activeAffects?.find(
      (a) => a.name === "Blindness"
    ) as BlindAffect;
    if (blindModule) {
      setAutoRedraw(blindModule.autoRedraw);
    }
  }, [engine]);

  const toggleAutoRedraw = () => {
    if (!engine) return;
    const e = engine as DrawEngine;
    const blindModule = e.activeAffects?.find(
      (a) => a.name === "Blindness"
    ) as BlindAffect;
    if (blindModule) {
      blindModule.autoRedraw = !blindModule.autoRedraw;
      setAutoRedraw(blindModule.autoRedraw);
    }
  };

  const handleRedraw = () => {
    if (engine) {
      (engine as DrawEngine).redrawBlindStrokes();
    }
  };

  return (
    <div className="flex items-center gap-4 text-xs font-mono">
      <div className="text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-2">
        {autoRedraw ? <Eye size={14} /> : <EyeOff size={14} />} Blind Mode
      </div>

      <button
        onClick={toggleAutoRedraw}
        className={`flex items-center gap-2 px-3 py-1 rounded border border-neutral-700 hover:border-neutral-500 transition-colors ${
          autoRedraw
            ? "bg-neutral-800 text-green-400"
            : "bg-black text-neutral-400"
        }`}
      >
        Auto: {autoRedraw ? "ON" : "OFF"}
      </button>

      <button
        onClick={handleRedraw}
        className="flex items-center gap-2 px-3 py-1 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors text-white"
      >
        <RefreshCw size={12} /> Redraw
      </button>
    </div>
  );
};
