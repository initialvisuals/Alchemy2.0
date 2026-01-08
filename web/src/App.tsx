import { CanvasStage } from "./components/CanvasStage";
import { UIOverlay } from "./components/UIOverlay";
import { Tooltip } from "./components/Tooltip";
import { useStore } from "./store";

export default function App() {
  const { hasInteracted } = useStore();

  return (
    <div className="w-screen h-screen bg-neutral-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
      <CanvasStage />
      <UIOverlay />
      {!hasInteracted && (
        <>
          <h1 className="text-4xl font-light tracking-widest uppercase opacity-50 select-none pointer-events-none z-10 mix-blend-difference">
            Alchemy 2.0
          </h1>
          <div className="absolute bottom-4 text-xs text-neutral-600 z-10 mix-blend-difference">
            Core Init
          </div>
        </>
      )}
      <Tooltip />
    </div>
  );
}
