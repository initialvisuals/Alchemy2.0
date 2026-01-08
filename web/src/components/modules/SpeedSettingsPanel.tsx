import { useStore } from "../../store";

export function SpeedSettingsPanel() {
  const { settings, updateSettings } = useStore();
  const speedParams = settings.moduleSettings["SPEED"] || {
    speedFactor: 2.0,
    curved: false,
  };

  const updateParams = (newParams: any) => {
    updateSettings({
      moduleSettings: {
        ...settings.moduleSettings,
        SPEED: { ...speedParams, ...newParams },
      },
    });
  };

  return (
    <div className="flex items-center gap-4 text-sm text-neutral-300">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase font-bold text-neutral-500">
          Speed
        </span>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={speedParams.speedFactor}
          onChange={(e) =>
            updateParams({ speedFactor: parseFloat(e.target.value) })
          }
          className="w-24 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <span className="w-8 text-right font-mono text-xs">
          {speedParams.speedFactor}x
        </span>
      </div>

      {/* Placeholder for Curved Toggle if we implement it */}
      {/* 
            <label className="flex items-center gap-2">
                 <input 
                    type="checkbox"
                    checked={speedParams.curved}
                    onChange={(e) => updateParams({ curved: e.target.checked })}
                 />
                 <span>Curved</span>
            </label>
            */}
    </div>
  );
}
