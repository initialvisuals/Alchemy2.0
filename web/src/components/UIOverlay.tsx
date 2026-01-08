import { useState, useEffect } from "react";
import { useStore } from "../store";
import { ContextSettingsPanel } from "./ContextSettingsPanel";

export function UIOverlay() {
  const {
    settings,
    updateSettings,
    activeModule,
    activeModules,
    toggleModule,
    setTooltip,
  } = useStore();
  const activeModuleId = activeModule;
  const [showSettings, setShowSettings] = useState<string>("");
  const [isPinned, setIsPinned] = useState(false);

  // Apply Dark Mode
  useEffect(() => {
    if (settings.isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.isDarkMode]);

  // Helper to convert number color to hex string
  const toHex = (num: number | undefined) => {
    return "#" + (num || 0).toString(16).padStart(6, "0");
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4">
      {/* Top Panel - Auto Hide Container */}
      <div
        className={`absolute top-0 left-0 right-0 p-2 transition-transform duration-300 ease-in-out transform z-50 pointer-events-auto flex flex-col gap-1 items-center pb-3 shadow-xl 
          bg-gray-200 border-b border-gray-400 
          dark:bg-neutral-800 dark:border-neutral-700
          ${
            isPinned
              ? "translate-y-0"
              : "-translate-y-[90%] hover:translate-y-0"
          }`}
      >
        {/* ROW 1: Global Tools */}
        <div className="flex items-center gap-4 w-full justify-center px-4">
          {/* GROUP 1: Style & Order */}
          <div className="flex gap-2 text-center">
            <button
              onClick={() =>
                updateSettings({
                  styleMode:
                    settings.styleMode === "STROKE" ? "FILL" : "STROKE",
                })
              }
              onMouseEnter={() =>
                setTooltip(
                  "Shape Style\nSwitch between Stroke (Outline) and Fill"
                )
              }
              onMouseLeave={() => setTooltip(null)}
              className="flex flex-col items-center group"
            >
              <div className="w-8 h-8 bg-black dark:bg-neutral-900 rounded border border-gray-400 dark:border-neutral-600 mb-0.5 flex items-center justify-center">
                {/* Visual usage of style */}
                <div
                  className={`w-4 h-4 ${
                    settings.styleMode === "FILL"
                      ? "bg-white"
                      : "border-2 border-white"
                  }`}
                />
              </div>
              <span className="text-[10px] text-gray-800 dark:text-gray-300 font-sans">
                Style
              </span>
            </button>

            <button
              onClick={() =>
                updateSettings({
                  drawOrder: settings.drawOrder === "OVER" ? "UNDER" : "OVER",
                })
              }
              onMouseEnter={() =>
                setTooltip("Draw Order\nDraw Over or Under existing shapes")
              }
              onMouseLeave={() => setTooltip(null)}
              className="flex flex-col items-center group"
            >
              <div
                className="w-8 h-8 rounded border border-gray-400 dark:border-neutral-600 mb-0.5 relative flex items-center justify-center
                bg-gray-300 dark:bg-neutral-700 text-black dark:text-white"
              >
                <span className="text-xl font-bold mb-1">
                  {settings.drawOrder === "OVER" ? "↑" : "↓"}
                </span>
              </div>
              <span className="text-[10px] text-gray-800 dark:text-gray-300 font-sans">
                Over
              </span>
            </button>
          </div>

          <div className="w-px h-8 border-l border-dotted border-gray-500 dark:border-gray-500 mx-1" />

          {/* GROUP 2: Line Weight */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-8 flex items-center px-1 mb-0.5 border border-gray-400 dark:border-neutral-600 bg-white dark:bg-neutral-900">
              <input
                type="number"
                min="1"
                max="100"
                value={settings.lineWeight || 1}
                onChange={(e) =>
                  updateSettings({ lineWeight: parseInt(e.target.value) || 1 })
                }
                onMouseEnter={() =>
                  setTooltip("Line Weight\nThickness of strokes")
                }
                onMouseLeave={() => setTooltip(null)}
                className="w-full text-center font-bold text-sm bg-transparent outline-none text-black dark:text-white"
              />
            </div>
            <span className="text-[10px] text-gray-800 dark:text-gray-300 font-sans">
              Line Weight
            </span>
          </div>

          <div className="w-px h-8 border-l border-dotted border-gray-500 mx-1" />

          {/* GROUP 3: Color Picker System */}
          <div className="flex gap-1 items-end">
            <div className="flex flex-col gap-1">
              {/* Background Color (Small, Behind) */}
              <label
                className="w-4 h-4 border border-gray-500 shadow-sm cursor-pointer ml-4 -mb-2 relative z-0"
                style={{ backgroundColor: toHex(settings.backgroundColor) }}
              >
                <input
                  type="color"
                  value={toHex(settings.backgroundColor)}
                  onChange={(e) =>
                    updateSettings({
                      backgroundColor: parseInt(
                        e.target.value.replace("#", "0x"),
                        16
                      ),
                    })
                  }
                  className="opacity-0 w-full h-full cursor-pointer"
                />
              </label>

              {/* Foreground Color (Main) */}
              <label
                className="w-8 h-8 border-2 border-white shadow-sm cursor-pointer relative z-10"
                style={{ backgroundColor: toHex(settings.foregroundColor) }}
              >
                <input
                  type="color"
                  value={toHex(settings.foregroundColor)}
                  onChange={(e) =>
                    updateSettings({
                      foregroundColor: parseInt(
                        e.target.value.replace("#", "0x"),
                        16
                      ),
                    })
                  }
                  className="opacity-0 w-full h-full cursor-pointer"
                  onMouseEnter={() =>
                    setTooltip("Primary Color\nClick to change")
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              </label>
            </div>

            {/* Swap Button */}
            <button
              onClick={() =>
                updateSettings({
                  foregroundColor: settings.backgroundColor,
                  backgroundColor: settings.foregroundColor,
                })
              }
              className="mb-1 text-[10px] border border-gray-400 px-1 rounded
                bg-gray-200 hover:bg-white text-black
                dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-gray-200 dark:border-neutral-500"
              title="" // Remove native tooltip
              onMouseEnter={() =>
                setTooltip("Swap Colors\nSwitch Foreground/Background")
              }
              onMouseLeave={() => setTooltip(null)}
            >
              wap
            </button>

            {/* Transparency Slider */}
            <div className="flex flex-col items-center w-20 ml-1">
              <div
                className="w-full h-8 flex items-center justify-center mb-0.5 border border-gray-400 px-1
                bg-gray-200 dark:bg-neutral-700 dark:border-neutral-600"
              >
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={(settings.opacity || 1) * 100}
                  onChange={(e) =>
                    updateSettings({ opacity: parseInt(e.target.value) / 100 })
                  }
                  className="w-full h-2 bg-gray-300 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
                  onMouseEnter={() =>
                    setTooltip("Transparency\nOpacity of new shapes")
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              </div>
              <span className="text-[10px] text-gray-800 dark:text-gray-300 font-sans">
                Transparency
              </span>
            </div>
          </div>

          <div className="w-px h-8 border-l border-dotted border-gray-500 mx-1" />

          {/* GROUP 4: Create & Affect (Menus) */}
          <div className="flex gap-2">
            {/* CREATE MENU */}
            <div className="relative">
              <button
                onClick={() =>
                  setShowSettings(showSettings === "CREATE" ? "" : "CREATE")
                }
                onMouseEnter={() =>
                  setTooltip("Create\nSelect a drawing module")
                }
                onMouseLeave={() => setTooltip(null)}
                className={`flex flex-col items-center rounded p-1
                  ${
                    showSettings === "CREATE"
                      ? "bg-gray-300 dark:bg-neutral-600"
                      : "hover:bg-gray-100 dark:hover:bg-neutral-700"
                  }`}
              >
                <div className="text-xl mb-0.5">✨</div>
                <span className="text-[10px] text-gray-800 dark:text-gray-200 font-sans flex items-center gap-1">
                  Create <span className="text-[8px] opacity-50">▼</span>
                </span>
              </button>

              {/* Dropdown */}
              {showSettings === "CREATE" && (
                <div
                  className="absolute top-full left-0 mt-2 w-48 shadow-xl z-50 flex flex-col text-sm py-1 max-h-[80vh] overflow-y-auto
                  bg-gray-100 border border-gray-400 
                  dark:bg-neutral-800 dark:border-neutral-600 dark:text-gray-200"
                >
                  {[
                    { id: "SHAPES", label: "Shapes" },
                    { id: "MIC", label: "Mic Shapes" },
                    { id: "SPEED", label: "Speed Shapes" },
                    { id: "X_SHAPES", label: "X Shapes", disabled: false },
                    {
                      id: "PRESSURE",
                      label: "Pressure Shapes",
                      disabled: false,
                    },
                    { id: "TYPE", label: "Type Shapes", disabled: false },
                    { id: "RIBBON", label: "Ribbon Shapes", disabled: false },
                    { id: "SCRAWL", label: "Scrawl Shapes", disabled: false },
                    {
                      id: "SPLATTER",
                      label: "Splatter Shapes",
                      disabled: false,
                    },
                    { id: "INVERSE", label: "Inverse Shapes", disabled: false },
                    { id: "PULL", label: "Pull Shapes" },
                    { id: "DETACH", label: "Detach Shapes", disabled: false },
                    { id: "TRACE", label: "Trace Shapes", disabled: false },
                    { id: "MEDIAN", label: "Median Shapes", disabled: false },
                  ].map((mod) => (
                    <button
                      key={mod.id}
                      disabled={mod.disabled}
                      onClick={() => {
                        if (!mod.disabled) {
                          useStore.getState().setActiveModule(mod.id);
                          setShowSettings("");
                        }
                      }}
                      className={`text-left px-3 py-1.5 hover:bg-gray-300 dark:hover:bg-neutral-700 
                        ${
                          activeModuleId === mod.id
                            ? "font-bold bg-gray-200 dark:bg-neutral-900"
                            : ""
                        } 
                        ${mod.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      onMouseEnter={() => setTooltip(`Select ${mod.label}`)}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {mod.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AFFECT MENU */}
            <div className="relative">
              <button
                onClick={() =>
                  setShowSettings(showSettings === "AFFECT" ? "" : "AFFECT")
                }
                onMouseEnter={() =>
                  setTooltip("Affect\nEnable/Disable modifiers")
                }
                onMouseLeave={() => setTooltip(null)}
                className={`flex flex-col items-center rounded p-1
                  ${
                    showSettings === "AFFECT"
                      ? "bg-gray-300 dark:bg-neutral-600"
                      : "hover:bg-gray-100 dark:hover:bg-neutral-700"
                  }`}
              >
                <div className="text-xl mb-0.5">⚡</div>
                <span className="text-[10px] text-gray-800 dark:text-gray-200 font-sans flex items-center gap-1">
                  Affect <span className="text-[8px] opacity-50">▼</span>
                </span>
              </button>
              {/* Dropdown */}
              {showSettings === "AFFECT" && (
                <div
                  className="absolute top-full left-0 mt-2 w-48 shadow-xl z-50 flex flex-col text-sm py-1 max-h-[80vh] overflow-y-auto
                  bg-gray-100 border border-gray-400 
                  dark:bg-neutral-800 dark:border-neutral-600 dark:text-gray-200"
                >
                  {[
                    { id: "DISPLACE", label: "Displace", desc: "Push/Pull" },
                    { id: "GRADIENT", label: "Gradient", desc: "Color Shift" },
                    { id: "MIRROR", label: "Mirror", desc: "Reflect" },
                    { id: "BLIND", label: "Blindness", desc: "Hide Output" },
                    { id: "RANDOM", label: "Random", desc: "Distort" },
                    {
                      id: "COLOR_SWITCH",
                      label: "Color Switcher",
                      desc: "Rainbow",
                    },
                    { id: "LIMIT", label: "Limit", desc: "Tail Effect" },
                    {
                      id: "MIC_EXPAND",
                      label: "Mic Expand",
                      desc: "Audio Scale",
                    },
                    { id: "SMOOTH", label: "Smooth", desc: "Stabilize" },
                    { id: "REPEAT", label: "Repeat", desc: "Clone" },
                  ].map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`text-left px-3 py-1.5 hover:bg-gray-300 dark:hover:bg-neutral-700 flex flex-col 
                        ${
                          activeModules.includes(mod.id)
                            ? "bg-gray-200 dark:bg-neutral-900"
                            : ""
                        }`}
                      onMouseEnter={() =>
                        setTooltip(`${mod.label}\n${mod.desc}`)
                      }
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold">{mod.label}</span>
                        {activeModules.includes(mod.id) && <span>✓</span>}
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {mod.desc}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-px h-8 border-l border-dotted border-gray-500 mx-1" />

          {/* GROUP 5: Actions */}
          <div className="flex gap-1 items-center">
            {/* Undo */}
            <button
              onClick={() => useStore.getState().engine?.undo()}
              className="flex flex-col items-center group hover:bg-gray-100 dark:hover:bg-neutral-600 p-1 rounded"
              onMouseEnter={() => setTooltip("Undo\nCtrl+Z")}
              onMouseLeave={() => setTooltip(null)}
            >
              <div className="text-xl mb-0.5 text-gray-800 dark:text-gray-200">
                ↶
              </div>
              <span className="text-[10px] text-gray-800 dark:text-gray-200 font-sans">
                Undo
              </span>
            </button>

            {/* Clear */}
            <button
              onClick={() => useStore.getState().engine?.clear()}
              className="flex flex-col items-center group hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded"
              onMouseEnter={() =>
                setTooltip("Clear Canvas\nRemove all strokes")
              }
              onMouseLeave={() => setTooltip(null)}
            >
              <div className="text-xl mb-0.5 text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400">
                ✕
              </div>
              <span className="text-[10px] text-gray-800 dark:text-gray-200 font-sans">
                Clear
              </span>
            </button>

            {/* Save */}
            <button
              onClick={() => useStore.getState().engine?.downloadImage()}
              className="flex flex-col items-center group hover:bg-gray-100 dark:hover:bg-neutral-600 p-1 rounded"
              onMouseEnter={() => setTooltip("Save Image\nDownload PNG")}
              onMouseLeave={() => setTooltip(null)}
            >
              <div className="text-xl mb-0.5 text-gray-800 dark:text-gray-200">
                💾
              </div>
              <span className="text-[10px] text-gray-800 dark:text-gray-200 font-sans">
                Save
              </span>
            </button>
          </div>

          {/* GROUP 6: Settings / Theme (Far Right) */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() =>
                updateSettings({ isDarkMode: !settings.isDarkMode })
              }
              className="flex flex-col items-center opacity-50 hover:opacity-100"
              onMouseEnter={() => setTooltip("Toggle Theme\nLight/Dark Mode")}
              onMouseLeave={() => setTooltip(null)}
            >
              <div className="w-4 h-4 rounded-full border border-gray-600 bg-gray-400 dark:bg-gray-600" />
              <span className="text-[8px] mt-1 text-black dark:text-white">
                Theme
              </span>
            </button>
          </div>
        </div>

        {/* ROW 2: Context Bar (Active Settings) - Thin Strip */}
        <div className="w-full h-px bg-gray-400 dark:bg-neutral-600" />

        <div
          className="flex w-full items-center h-6 rounded-b border-b overflow-hidden
          bg-gray-300 border-gray-400
          dark:bg-neutral-800 dark:border-neutral-700"
        >
          {/* The ContextSettingsPanel now handles its own labels and layout */}
          <ContextSettingsPanel />
        </div>

        {/* Pin/Unpin Toggle (Replaces Handle) */}
        <button
          onClick={() => setIsPinned(!isPinned)}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-8 h-3 rounded-b-lg border-b border-l border-r border-t-0 flex items-center justify-center cursor-pointer shadow-md
            bg-gray-200 border-gray-400 hover:bg-gray-100
            dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700"
          onMouseEnter={() =>
            setTooltip(
              isPinned
                ? "Unpin Panel\nAllow auto-hide"
                : "Pin Panel\nKeep visible"
            )
          }
          onMouseLeave={() => setTooltip(null)}
        >
          <span
            className={`text-[8px] transform transition-transform text-black dark:text-white ${
              isPinned ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>
      </div>
    </div>
  );
}
