import { useStore } from "../../store";
import { RefreshCw } from "lucide-react";

export function PullSettingsPanel() {
  const { settings, updateSettings } = useStore();
  // We need a place to store "Pull" specific settings.
  // Currently `settings` is global.
  // Ideally we add `pullSettings` to the global store or just generic `moduleSettings` map.

  // Let's assume we use `moduleSettings` dictionary for flexibility.

  const currentSet = settings.moduleSettings?.["PULL_SET"] || "ALL";
  const spacing = settings.moduleSettings?.["PULL_SPACING"] || 40;
  const scale = settings.moduleSettings?.["PULL_SCALE"] || 50; // 0-100 representing 0.1 to 2.0

  const updatePullSetting = (key: string, value: any) => {
    updateSettings({
      moduleSettings: {
        ...settings.moduleSettings,
        [key]: value,
      },
    });
  };

  return (
    <div className="flex items-center gap-4 px-2">
      {/* Shape Set Selector */}
      <div className="flex flex-col gap-1 w-24">
        <label className="text-[9px] text-neutral-500 font-bold tracking-wider">
          SHAPE SET
        </label>
        <select
          value={currentSet}
          onChange={(e) => updatePullSetting("PULL_SET", e.target.value)}
          className="bg-neutral-800 text-neutral-200 text-xs border border-neutral-700 rounded px-1 py-0.5"
        >
          <option value="ALL">All Shapes</option>
          <option value="BONES">Bones Folder</option>
          <option value="CIRCLES">Circles Folder</option>
          <option value="PARTS">Parts Folder</option>
          <option value="TANGRAM">Tanagram Folder</option>
        </select>
      </div>

      <button
        onClick={() => updatePullSetting("PULL_RELOAD", Date.now())}
        className="flex items-center gap-1 px-2 py-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-neutral-700"
      >
        <RefreshCw size={12} />
        <span className="text-[10px] font-bold">Reload</span>
      </button>

      {/* Spacing */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] text-neutral-500 font-bold tracking-wider">
          Spacing
        </label>
        <input
          type="range"
          min="5"
          max="200"
          value={spacing}
          onChange={(e) =>
            updatePullSetting("PULL_SPACING", parseInt(e.target.value))
          }
          className="accent-neutral-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer w-16"
        />
      </div>

      {/* Size */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] text-neutral-500 font-bold tracking-wider">
          Size
        </label>
        <input
          type="range"
          min="10"
          max="200"
          value={scale}
          onChange={(e) =>
            updatePullSetting("PULL_SCALE", parseInt(e.target.value))
          }
          className="accent-neutral-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer w-16"
        />
      </div>

      {/* Rotate Toggle */}
      <button
        onClick={() =>
          updatePullSetting(
            "PULL_ROTATE",
            !settings.moduleSettings?.["PULL_ROTATE"]
          )
        }
        className={`flex items-center gap-1 px-2 py-1 rounded border ${
          settings.moduleSettings?.["PULL_ROTATE"] !== false
            ? "border-green-900/50 bg-green-900/20 text-green-500"
            : "border-neutral-700 bg-neutral-800 text-neutral-500"
        }`}
      >
        <RefreshCw
          size={12}
          className={
            settings.moduleSettings?.["PULL_ROTATE"] !== false
              ? ""
              : "opacity-50"
          }
        />
        <span className="text-[10px] font-bold">Rotate</span>
      </button>
    </div>
  );
}
