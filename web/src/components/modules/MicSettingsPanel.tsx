import { useStore } from "../../store";
import { Mic, Waves } from "lucide-react";

export function MicSettingsPanel() {
  const { settings, updateSettings } = useStore();
  const micParams = settings.moduleSettings["MIC"] || {
    mode: "FATTEN",
    gain: 1.0,
  };

  const updateParams = (newParams: any) => {
    updateSettings({
      moduleSettings: {
        ...settings.moduleSettings,
        MIC: { ...micParams, ...newParams },
      },
    });
  };

  return (
    <div className="flex items-center gap-4 text-sm text-neutral-300">
      <div className="flex items-center gap-2 border-r border-neutral-700 pr-4">
        <span className="text-xs uppercase font-bold text-neutral-500">
          Mode
        </span>
        <button
          className={`p-1 rounded ${
            micParams.mode === "FATTEN"
              ? "bg-orange-500 text-white"
              : "bg-neutral-800 text-neutral-400"
          }`}
          onClick={() => updateParams({ mode: "FATTEN" })}
          title="Fatten Mode"
        >
          <Waves size={16} />
        </button>
        <button
          className={`p-1 rounded ${
            micParams.mode === "SHAKE"
              ? "bg-orange-500 text-white"
              : "bg-neutral-800 text-neutral-400"
          }`}
          onClick={() => updateParams({ mode: "SHAKE" })}
          title="Shake Mode"
        >
          <Mic size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs uppercase font-bold text-neutral-500">
          Sensitivity
        </span>
        <input
          type="range"
          min="0.1"
          max="3.0"
          step="0.1"
          value={micParams.gain}
          onChange={(e) => updateParams({ gain: parseFloat(e.target.value) })}
          className="w-24 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      {!settings.micEnabled && (
        <div className="text-xs text-red-500 font-bold animate-pulse ml-2">
          MIC DISABLED (Enable in Toolbar)
        </div>
      )}
    </div>
  );
}
