import { useEffect, useRef } from "react";
import { Application } from "pixi.js";
import { useStore } from "../store";
import { DrawEngine } from "../kernel/DrawEngine";
import { AudioProcessor } from "../kernel/AudioProcessor";
import { MirrorAffect } from "../modules/MirrorAffect";
import { BlindAffect } from "../modules/BlindAffect";
import { DisplaceAffect } from "../modules/DisplaceAffect";
import { RandomAffect } from "../modules/RandomAffect";
import { SketchModule } from "../modules/SketchModule";
import { PullModule } from "../modules/PullModule";
import { XShapeModule } from "../modules/XShapeModule";
import { ScrawlModule } from "../modules/ScrawlModule";
import { RibbonModule } from "../modules/RibbonModule";
import { SplatterModule } from "../modules/SplatterModule";
import { TypeModule } from "../modules/TypeModule";
import { PressureModule } from "../modules/PressureModule";
import { InverseModule } from "../modules/InverseModule";
import { DetachModule } from "../modules/DetachModule";
import { MedianModule } from "../modules/MedianModule";
import { GradientAffect } from "../modules/GradientAffect";
import { ColorSwitcherAffect } from "../modules/ColorSwitcherAffect";
import { MicExpandAffect } from "../modules/MicExpandAffect";
import { LimitAffect } from "../modules/LimitAffect";
import { SmoothAffect } from "../modules/SmoothAffect";
import { RepeatAffect } from "../modules/RepeatAffect";
import { TraceModule } from "../modules/TraceModule";
import { MicModule } from "../modules/MicModule";
import { SpeedModule } from "../modules/SpeedModule";

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const settings = useStore((state) => state.settings);
  const engineRef = useRef<DrawEngine | null>(null);
  const audioRef = useRef<AudioProcessor | null>(null);

  // Initialize Pixi App and Engine
  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    let appInstance: Application | null = null;
    let engineInstance: DrawEngine | null = null;

    // Init Audio
    const audioProcessor = new AudioProcessor();
    audioRef.current = audioProcessor;

    const initApp = async () => {
      const app = new Application();

      await app.init({
        resizeTo: window,
        background: settings.backgroundColor,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });

      if (!isMounted) {
        // Component unmounted while initializing
        app.destroy(true, { children: true, texture: true });
        return;
      }

      appInstance = app;

      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas);
      }

      // Init Engine
      const engine = new DrawEngine(app);
      engineInstance = engine;
      engineRef.current = engine;
      useStore.getState().setEngine(engine); // Set Global Engine

      engine.updateSettings(settings); // Initial sync
      engine.setAudioProcessor(audioProcessor);

      // Events
      app.stage.eventMode = "static";
      app.stage.hitArea = app.screen;

      app.stage.on("pointerdown", (e) => {
        engine.startStrike(e.global.x, e.global.y);
      });
      app.stage.on("pointermove", (e) => {
        engine.moveStroke(e.global.x, e.global.y);
      });
      app.stage.on("pointerup", () => {
        engine.endStroke();
      });
      app.stage.on("pointerupoutside", () => {
        engine.endStroke();
      });
    };

    initApp();

    return () => {
      isMounted = false;
      audioProcessor.stop();

      if (engineInstance) {
        engineInstance.destroy();
      }

      if (appInstance) {
        appInstance.destroy(true, { children: true, texture: true });
      }
    };
  }, []); // Run once on mount

  // Sync settings to engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateSettings(settings);

      // If settings has clear flag logic or similar, handle here
    }

    // Manage Audio State
    if (settings.micEnabled) {
      audioRef.current?.start();
    } else {
      audioRef.current?.stop();
    }
  }, [settings]);

  // Handle Module Switching
  const activeModuleId = useStore((state) => state.activeModule);
  useEffect(() => {
    if (!engineRef.current) return;

    // Module Switching Logic
    if (activeModuleId === "SHAPES") {
      engineRef.current.setModule(() => new SketchModule());
    } else if (activeModuleId === "PULL") {
      engineRef.current.setModule(() => new PullModule());
    } else if (activeModuleId === "X_SHAPES") {
      engineRef.current.setModule(() => new XShapeModule());
    } else if (activeModuleId === "SCRAWL") {
      engineRef.current.setModule(() => new ScrawlModule());
    } else if (activeModuleId === "RIBBON") {
      engineRef.current.setModule(() => new RibbonModule());
    } else if (activeModuleId === "SPLATTER") {
      engineRef.current.setModule(() => new SplatterModule());
    } else if (activeModuleId === "TYPE") {
      engineRef.current.setModule(() => new TypeModule());
    } else if (activeModuleId === "PRESSURE") {
      engineRef.current.setModule(() => new PressureModule());
    } else if (activeModuleId === "INVERSE") {
      engineRef.current.setModule(() => new InverseModule());
    } else if (activeModuleId === "DETACH") {
      engineRef.current.setModule(() => new DetachModule());
    } else if (activeModuleId === "MEDIAN") {
      engineRef.current.setModule(() => new MedianModule());
    } else if (activeModuleId === "MIC") {
      engineRef.current.setModule(() => new MicModule());
    } else if (activeModuleId === "SPEED") {
      engineRef.current.setModule(() => new SpeedModule());
    } else if (activeModuleId === "TRACE") {
      const mod = new TraceModule();
      const engine = engineRef.current;
      if (engine && engine.traceImage) {
        mod.loadImage(engine.traceImage);
      }
      engineRef.current.setModule(() => mod);
    }

    console.log("Switched to module:", activeModuleId);
  }, [activeModuleId]);

  // Handle Affects separately (when settings change or activeModules change)
  const activeModules = useStore((state) => state.activeModules);

  useEffect(() => {
    if (!engineRef.current) return;

    engineRef.current.clearAffects();

    // 0. Smooth (Stabilize Input)
    if (activeModules.includes("SMOOTH")) {
      engineRef.current.addAffect(new SmoothAffect());
    }

    // 1. Mirror
    engineRef.current.addAffect(new MirrorAffect());

    // 2. Blindness
    if (activeModules.includes("BLIND")) {
      engineRef.current.addAffect(new BlindAffect());
    }

    // 3. Displace
    if (activeModules.includes("DISPLACE")) {
      engineRef.current.addAffect(new DisplaceAffect());
    }

    // 4. Random
    if (activeModules.includes("RANDOM")) {
      engineRef.current.addAffect(new RandomAffect());
    }

    // 5. Gradient
    if (activeModules.includes("GRADIENT")) {
      engineRef.current.addAffect(new GradientAffect());
    }

    // 6. Color Switcher
    if (activeModules.includes("COLOR_SWITCH")) {
      engineRef.current.addAffect(new ColorSwitcherAffect());
    }

    // 7. Mic Expand
    if (activeModules.includes("MIC_EXPAND")) {
      engineRef.current.addAffect(new MicExpandAffect());
    }

    // 8. Limit
    if (activeModules.includes("LIMIT")) {
      engineRef.current.addAffect(new LimitAffect());
    }

    // 9. Repeat
    if (activeModules.includes("REPEAT")) {
      engineRef.current.addAffect(new RepeatAffect());
    }
  }, [activeModules, settings.mirror, settings.mirrorMode]); // Re-run when affect-relevant settings change

  // Handle Actions (Clear, Save)
  const action = useStore((state) => state.action);
  const triggerAction = useStore((state) => state.triggerAction);

  useEffect(() => {
    if (action === "NONE" || !engineRef.current) return;

    if (action === "CLEAR") {
      engineRef.current.clear();
      triggerAction("NONE");
    } else if (action === "SAVE") {
      engineRef.current.downloadImage();
      triggerAction("NONE");
    } else if (action === "UNDO") {
      engineRef.current.undo();
      triggerAction("NONE");
    }
  }, [action]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        triggerAction("UNDO");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden" />
  );
}
