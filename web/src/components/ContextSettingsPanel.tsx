import { useStore } from "../store";

export function ContextSettingsPanel() {
  const { activeModule, activeModules, settings, updateSettings, setTooltip } =
    useStore();
  const modSettings = settings.moduleSettings;

  // Helper to update module-specific config
  const setModValue = (moduleId: string, key: string, value: any) => {
    updateSettings({
      moduleSettings: {
        ...modSettings,
        [moduleId]: {
          ...(modSettings[moduleId] || {}),
          [key]: value,
        },
      },
    });
  };

  const getModValue = (moduleId: string, key: string, def: any) => {
    return modSettings[moduleId]?.[key] ?? def;
  };

  // Render function for a specific module ID, optimized for horizontal ribbon
  const renderModuleSettings = (moduleId: string) => {
    switch (moduleId) {
      case "SHAPES":
        return (
          <div className="flex items-center gap-2">
            <label
              className="flex items-center gap-1 text-[10px] whitespace-nowrap cursor-pointer select-none text-black dark:text-white"
              onMouseEnter={() =>
                setTooltip("Straight Lines\nDraw straight segments")
              }
              onMouseLeave={() => setTooltip(null)}
            >
              <input
                type="checkbox"
                checked={getModValue(moduleId, "straight", false)}
                onChange={(e) =>
                  setModValue(moduleId, "straight", e.target.checked)
                }
              />
              Straight
            </label>
          </div>
        );

      case "X_SHAPES":
        return (
          <div className="flex items-center gap-1">
            <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
              Prob
            </span>
            <input
              type="range"
              min="1"
              max="100"
              value={getModValue(moduleId, "probability", 50)}
              onChange={(e) =>
                setModValue(moduleId, "probability", parseInt(e.target.value))
              }
              onMouseEnter={() =>
                setTooltip("Probability\nChance of X appearing")
              }
              onMouseLeave={() => setTooltip(null)}
              className="w-16 h-1.5 bg-gray-300 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        );

      case "SCRAWL":
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
                Noise
              </span>
              <input
                type="range"
                min="1"
                max="50"
                value={getModValue(moduleId, "noise", 10)}
                onChange={(e) =>
                  setModValue(moduleId, "noise", parseInt(e.target.value))
                }
                onMouseEnter={() => setTooltip("Noise\nRandomness of scrawl")}
                onMouseLeave={() => setTooltip(null)}
                className="w-12 h-1.5 bg-gray-300 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
                Steps
              </span>
              <input
                type="range"
                min="1"
                max="20"
                value={getModValue(moduleId, "steps", 5)}
                onChange={(e) =>
                  setModValue(moduleId, "steps", parseInt(e.target.value))
                }
                onMouseEnter={() => setTooltip("Steps\nVertices per stroke")}
                onMouseLeave={() => setTooltip(null)}
                className="w-12 h-1.5 bg-gray-300 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        );

      case "DETACH":
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
                Dist
              </span>
              <input
                type="range"
                min="1"
                max="200"
                value={getModValue(moduleId, "distance", 50)}
                onChange={(e) =>
                  setModValue(moduleId, "distance", parseInt(e.target.value))
                }
                onMouseEnter={() => setTooltip("Distance\nDetach threshold")}
                onMouseLeave={() => setTooltip(null)}
                className="w-12 h-1.5 bg-gray-300 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
                Spring
              </span>
              <input
                type="range"
                min="1"
                max="100"
                value={getModValue(moduleId, "spring", 10)}
                onChange={(e) =>
                  setModValue(moduleId, "spring", parseInt(e.target.value))
                }
                onMouseEnter={() => setTooltip("Spring\nReturn force")}
                onMouseLeave={() => setTooltip(null)}
                className="w-12 h-1.5 bg-gray-300 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        );

      case "TYPE":
        return (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Chars..."
              value={getModValue(moduleId, "chars", "")}
              onChange={(e) => setModValue(moduleId, "chars", e.target.value)}
              onMouseEnter={() => setTooltip("Characters\nText to scatter")}
              onMouseLeave={() => setTooltip(null)}
              className="border border-gray-400 px-1 text-[9px] h-4 w-20 bg-white text-black dark:bg-neutral-700 dark:text-white dark:border-neutral-500"
            />
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
                Size
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={getModValue(moduleId, "jitter", 50)}
                onChange={(e) =>
                  setModValue(moduleId, "jitter", parseInt(e.target.value))
                }
                onMouseEnter={() => setTooltip("Size Jitter\nRandom text size")}
                onMouseLeave={() => setTooltip(null)}
                className="w-12 h-1.5 bg-gray-300 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        );

      case "TRACE":
        return (
          <div className="flex items-center gap-2">
            <label
              className="bg-white dark:bg-neutral-700 border border-gray-400 dark:border-neutral-500 rounded px-2 py-0.5 text-[9px] cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600"
              onMouseEnter={() =>
                setTooltip("Load Image\nSelect image to trace")
              }
              onMouseLeave={() => setTooltip(null)}
            >
              Load Image
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // We need to pass this to the module instances
                    // Store generic event? or specific settings key?
                    // Since modules are instances, we usually pass settings.
                    // But File objects in standard JSON settings is tricky.
                    // Let's fire a global event or valid method.
                    // For now, let's put it in store but we can't serialise easily.
                    // Better: Use a helper on the Engine if available?
                    // Or just trigger a custom event the engine listens to.
                    window.dispatchEvent(
                      new CustomEvent("alchemy-trace-load", { detail: file })
                    );
                  }
                }}
              />
            </label>
            <span className="text-[8px] text-gray-500 italic">
              Drag & Drop supported
            </span>
          </div>
        );

      case "LIMIT":
        return (
          <div className="flex items-center gap-1">
            <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
              Max
            </span>
            <input
              type="range"
              min="10"
              max="200"
              value={getModValue(moduleId, "limit", 50)}
              onChange={(e) =>
                setModValue(moduleId, "limit", parseInt(e.target.value))
              }
              onMouseEnter={() => setTooltip("Max Length\nPrunes tail strokes")}
              onMouseLeave={() => setTooltip(null)}
              className="w-16 h-1.5 bg-[#ffcccc] rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
        );

      case "DISPLACE":
        return (
          <div className="flex items-center gap-1">
            <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
              Str
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={getModValue(moduleId, "displacement", 50)}
              onChange={(e) =>
                setModValue(moduleId, "displacement", parseInt(e.target.value))
              }
              onMouseEnter={() => setTooltip("Strength\nDisplacement power")}
              onMouseLeave={() => setTooltip(null)}
              className="w-16 h-1.5 bg-[#ccffcc] rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
        );

      case "RANDOM":
        return (
          <div className="flex items-center gap-1">
            <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
              Chaos
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={getModValue(moduleId, "chaos", 20)}
              onChange={(e) =>
                setModValue(moduleId, "chaos", parseInt(e.target.value))
              }
              onMouseEnter={() => setTooltip("Chaos\nPosition jitter amount")}
              onMouseLeave={() => setTooltip(null)}
              className="w-16 h-1.5 bg-[#ccccff] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        );

      case "BLIND":
        return (
          <label
            className="flex items-center gap-1 text-[9px] whitespace-nowrap cursor-pointer select-none text-black dark:text-white"
            onMouseEnter={() => setTooltip("Auto-Redraw\nShow strokes on lift")}
            onMouseLeave={() => setTooltip(null)}
          >
            <input
              type="checkbox"
              checked={getModValue(moduleId, "autoRedraw", true)}
              onChange={(e) =>
                setModValue(moduleId, "autoRedraw", e.target.checked)
              }
            />
            Auto-Redraw
          </label>
        );

      case "MIRROR":
        return (
          <div className="flex items-center gap-0.5 text-[8px]">
            <button
              onClick={() => updateSettings({ mirrorMode: "HORIZONTAL" })}
              onMouseEnter={() => setTooltip("Horizontal Mirror")}
              onMouseLeave={() => setTooltip(null)}
              className={`px-1 py-0 border ${
                settings.mirrorMode === "HORIZONTAL"
                  ? "bg-gray-400 dark:bg-gray-500 font-bold text-white"
                  : "bg-white dark:bg-neutral-700 text-black dark:text-white border-gray-400 dark:border-neutral-500"
              }`}
            >
              H
            </button>
            <button
              onClick={() => updateSettings({ mirrorMode: "VERTICAL" })}
              onMouseEnter={() => setTooltip("Vertical Mirror")}
              onMouseLeave={() => setTooltip(null)}
              className={`px-1 py-0 border ${
                settings.mirrorMode === "VERTICAL"
                  ? "bg-gray-400 dark:bg-gray-500 font-bold text-white"
                  : "bg-white dark:bg-neutral-700 text-black dark:text-white border-gray-400 dark:border-neutral-500"
              }`}
            >
              V
            </button>
            <button
              onClick={() => updateSettings({ mirrorMode: "QUAD" })}
              onMouseEnter={() => setTooltip("Quad (4-way) Mirror")}
              onMouseLeave={() => setTooltip(null)}
              className={`px-1 py-0 border ${
                settings.mirrorMode === "QUAD"
                  ? "bg-gray-400 dark:bg-gray-500 font-bold text-white"
                  : "bg-white dark:bg-neutral-700 text-black dark:text-white border-gray-400 dark:border-neutral-500"
              }`}
            >
              Q
            </button>
          </div>
        );

      case "MIC_EXPAND":
        return (
          <div className="flex items-center gap-1">
            <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
              Gain
            </span>
            <input
              type="range"
              min="0"
              max="50"
              value={getModValue(moduleId, "gain", 1.0) * 10}
              onChange={(e) =>
                setModValue(moduleId, "gain", parseInt(e.target.value) / 10)
              }
              onMouseEnter={() =>
                setTooltip("Mic Gain\nAudio sensitivity boost")
              }
              onMouseLeave={() => setTooltip(null)}
              className="w-16 h-1.5 bg-[#ffaa00] rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        );

      case "REPEAT":
        return (
          <div className="flex items-center gap-1">
            <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
              Chance
            </span>
            <input
              type="range"
              min="1"
              max="50"
              value={getModValue(moduleId, "chance", 5)}
              onChange={(e) =>
                setModValue(moduleId, "chance", parseInt(e.target.value))
              }
              onMouseEnter={() =>
                setTooltip("Clone Chance\nProbability to duplicate stroke")
              }
              onMouseLeave={() => setTooltip(null)}
              className="w-16 h-1.5 bg-[#aa00ff] rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        );

      case "SMOOTH":
        return (
          <div className="flex items-center gap-1">
            <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
              Smooth
            </span>
            <input
              type="range"
              min="1"
              max="50"
              value={getModValue(moduleId, "smoothing", 15)}
              onChange={(e) =>
                setModValue(moduleId, "smoothing", parseInt(e.target.value))
              }
              onMouseEnter={() => setTooltip("Smoothing\nStabilization amount")}
              onMouseLeave={() => setTooltip(null)}
              className="w-16 h-1.5 bg-[#00aaff] rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        );

      case "COLOR":
        return (
          <div className="flex items-center gap-1">
            <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400">
              Strobe
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={getModValue(moduleId, "prob", 100)}
              onChange={(e) =>
                setModValue(moduleId, "prob", parseInt(e.target.value))
              }
              onMouseEnter={() =>
                setTooltip("Strobe %\nChance to switch color per point")
              }
              onMouseLeave={() => setTooltip(null)}
              className="w-16 h-1.5 bg-gradient-to-r from-red-500 to-blue-500 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const relevantModules = [activeModule, ...activeModules];

  return (
    <div className="flex items-center h-full w-full overflow-x-auto no-scrollbar whitespace-nowrap px-1">
      {relevantModules.map((modId) => {
        const content = renderModuleSettings(modId);
        if (!content) return null;

        return (
          <div
            key={modId}
            className="flex items-center gap-2 border-r border-gray-400 dark:border-neutral-600 px-3 last:border-0 shrink-0 h-4/5"
          >
            <span className="text-[9px] font-bold text-black dark:text-white uppercase">
              {modId.replace("_SHAPES", "").replace("_EXPAND", "")}
            </span>
            {content}
          </div>
        );
      })}
    </div>
  );
}
