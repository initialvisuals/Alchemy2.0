
import { useStore } from '../store';
import { Application, Container, Graphics } from 'pixi.js';
import type { AlchemySettings } from '../types';
import type { AudioProcessor } from './AudioProcessor';
import type { DrawModule, DrawContext } from '../modules/DrawModule';
import { SketchModule } from '../modules/SketchModule';
import type { AffectModule, PointTransform } from '../modules/AffectModule';
import { SpatialHash } from './SpatialHash';

export class DrawEngine {
    private app: Application;
    private drawing: boolean = false;
    private container: Container;
    private cursorContainer: Container;
    private settings: AlchemySettings | null = null;
    private audioProcessor: AudioProcessor | null = null;
    
    // Module System
    private spatialHash: SpatialHash<Container>;
    private activeModuleFactory: () => DrawModule;
    private moduleInstances: Map<string, DrawModule> = new Map();
    public activeAffects: AffectModule[] = [];

    private history: Container[] = [];
    private currentStroke: Container | null = null;
    
    // We bind this so we can add/remove listener
    private onPointerMoveBound = (e: PointerEvent) => this.handleGlobalPointerMove(e);

    constructor(app: Application) {
        this.app = app;
        this.container = new Container();
        this.app.stage.addChild(this.container);

        // Cursors Layer (Top)
        this.cursorContainer = new Container();
        this.app.stage.addChild(this.cursorContainer);
        
        this.spatialHash = new SpatialHash<Container>(100);
        
        // Default factory
        this.activeModuleFactory = () => new SketchModule();
        
        // Listen for global pointer moves for Rollover
        if (this.app.canvas) {
            this.app.canvas.addEventListener('pointermove', this.onPointerMoveBound);
        }
        
        // Trace Load Listener
        window.addEventListener('alchemy-trace-load', (e: any) => {
             const file = e.detail;
             if (file) {
                 // Check if active module is Trace
                 // We need a place to store global Trace image.
                 this.traceImage = file;
             }
        });
    }
    
    public traceImage: File | null = null;
    
    destroy() {
         if (this.app.canvas) {
            this.app.canvas.removeEventListener('pointermove', this.onPointerMoveBound);
        }
        this.moduleInstances.forEach(m => m.dispose && m.dispose());
        this.moduleInstances.clear();
    }

    setAudioProcessor(processor: AudioProcessor) {
        this.audioProcessor = processor;
    }

    updateSettings(settings: AlchemySettings) {
        this.settings = settings;
        
        // Apply Background Color
        if (this.app.renderer) {
            this.app.renderer.background.color = settings.backgroundColor;
        }
    }
    
    setModule(factory: () => DrawModule) {
        // Cleanup old instances
        this.moduleInstances.forEach(m => m.dispose && m.dispose());
        this.moduleInstances.clear();
        
        this.activeModuleFactory = factory;
    }
    
    addAffect(affect: AffectModule) {
        this.activeAffects.push(affect);
    }
    
    clearAffects() {
        this.activeAffects = [];
    }
    
    // Helper to get all point transforms from the pipeline
    private applyAffects(x: number, y: number, context: DrawContext): PointTransform[] {
        let points: PointTransform[] = [{ id: 'main', x, y }];
        
        // Run through affect chain
        for (const affect of this.activeAffects) {
            const nextPoints: PointTransform[] = [];
            for (const pt of points) {
                const transforms = affect.transform(pt.x, pt.y, context);
                
                transforms.forEach(t => {
                    // Merge Styles: Existing Style + New Style
                    // If the affect didn't provide style, keep the old one.
                    // If it did, override. 
                    const mergedStyle = { ...pt.style, ...t.style };
                    
                    nextPoints.push({
                        id: pt.id + '_' + t.id,
                        x: t.x,
                        y: t.y,
                        style: mergedStyle
                    });
                });
            }
            points = nextPoints;
        }
        
        return points;
    }
    
    private handleGlobalPointerMove(e: PointerEvent) {
        if (this.drawing) return; // Handled by moveStroke
        if (!this.settings) return;
        
        // Convert to canvas space
        const rect = (this.app.canvas as HTMLCanvasElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.processRollover(x, y);
    }
    
    private processRollover(x: number, y: number) {
        // Clear previous cursors
        this.cursorContainer.removeChildren().forEach(c => c.destroy());
        
        const context = this.getContext();
        
        // 1. Calculate Virtual Points (Mirror, Repeat, etc.)
        const cursors = this.applyAffects(x, y, context);
        
        cursors.forEach(cursor => {
             // 2. Module Preview (e.g. Inverse, Trace)
             let activeInstance = this.moduleInstances.get(cursor.id);
             if (!activeInstance) {
                 activeInstance = this.activeModuleFactory();
                 // We don't store it to avoid state leakage on hover
             }
             
             if (activeInstance.onPointHover) {
                 const shapes = activeInstance.onPointHover(cursor.x, cursor.y, context);
                 if (shapes) {
                      shapes.forEach(g => this.cursorContainer.addChild(g)); 
                 }
             } else {
                 // 3. Render Cursor based on Active Module
                 const activeModuleId = useStore.getState().activeModule;
                 const g = new Graphics();
                 
                 // Default Style
                 let color = 0x999999;
                 let alpha = 0.8;
                 
                 switch (activeModuleId) {
                     case "DISPLACE":
                     case "PULL":
                     case "DETACH":
                         // Circle cursor for area of effect
                         g.setStrokeStyle({ width: 1, color, alpha });
                         g.circle(cursor.x, cursor.y, 20); // standard radius
                         g.stroke();
                         break;
                         
                     case "MIC":
                     case "MIC_EXPAND":
                         // Audio Reactive Cursor
                         const vol = this.audioProcessor?.isActive ? this.audioProcessor.getVolume() : 0;
                         const radius = 5 + (vol * 50);
                         g.setStrokeStyle({ width: 1, color: 0x00ff00, alpha });
                         g.circle(cursor.x, cursor.y, radius);
                         g.stroke();
                         break;
                         
                     default:
                         // Crosshair
                         g.setStrokeStyle({ width: 1, color, alpha });
                         g.moveTo(cursor.x - 5, cursor.y);
                         g.lineTo(cursor.x + 5, cursor.y);
                         g.moveTo(cursor.x, cursor.y - 5);
                         g.lineTo(cursor.x, cursor.y + 5);
                         g.stroke();
                         break;
                 }
                 
                 this.cursorContainer.addChild(g);
             }
        });

        // 3. Affect Rollover (Random, Repeat, etc.)
        cursors.forEach(cursor => {
            // Query Spatial Hash
            const range = 50; 
            const nearby = this.spatialHash.query(cursor.x - range, cursor.y - range, range * 2, range * 2);
            
            if (nearby.length > 0) {
                // Apply active affects to these strokes
                this.activeAffects.forEach(affect => {
                     if (affect.onRollover) {
                         const newShapes = affect.onRollover(cursor.x, cursor.y, nearby, context);
                         
                         if (newShapes && Array.isArray(newShapes)) {
                             newShapes.forEach(shape => {
                                 // Add interactive shapes (like pushed strokes) to main container?
                                 // Or cursor container?
                                 // Usually Affects modify EXISTING shapes (nearby).
                                 // If they return NEW shapes (e.g. clones), we verify behavior.
                                 // Legacy behavior: Add to container.
                                 this.container.addChild(shape);
                             });
                         }
                     }
                });
            }
        });
    }

    private getContext(): DrawContext {
        return {
            settings: this.settings!,
            audio: this.audioProcessor,
            screenWidth: this.app.screen.width,
            screenHeight: this.app.screen.height
        };
    }

    private lastX: number = 0;
    private lastY: number = 0;

    startStrike(x: number, y: number) {
        if (!this.settings) return;

        this.drawing = true;
        this.lastX = x;
        this.lastY = y;
        
        // Hide Title
        if (!useStore.getState().hasInteracted) {
            useStore.getState().setHasInteracted();
        }
        
        // Handle Blindness (Check active affects for BlindAffect)
        const blindAffect = this.activeAffects.find(a => a.name === "Blindness"); // Simple check for now
        
        if (blindAffect && this.currentStroke) {
            this.currentStroke.visible = false;
            (this.currentStroke as any)._blind = true; // Temporary marker
        }
        
        // Create new stroke container
        this.currentStroke = new Container();
        
        // Handle Draw Order
        if (this.settings?.drawOrder === 'UNDER') {
            this.container.addChildAt(this.currentStroke, 0);
        } else {
            this.container.addChild(this.currentStroke);
        }

        const context = this.getContext();
        context.speed = 0; // Initial speed is 0
        
        // Calculate points (Affect Pipeline)
        const points = this.applyAffects(x, y, context);
        
        // Process each virtual cursor
        points.forEach(pt => {
             let instance = this.moduleInstances.get(pt.id);
             if (!instance) {
                 instance = this.activeModuleFactory();
                 this.moduleInstances.set(pt.id, instance);
             }
             
             // Pass Style Overrides!
             const graphics = instance.onPointDown(pt.x, pt.y, context, pt.style);
             graphics.forEach(g => this.currentStroke?.addChild(g));
        });
    }

    moveStroke(x: number, y: number) {
        if (!this.drawing || !this.currentStroke) return;
        
        // Calculate Speed (Delta distance)
        const dx = x - this.lastX;
        const dy = y - this.lastY;
        const speed = Math.sqrt(dx * dx + dy * dy);
        
        this.lastX = x;
        this.lastY = y;
        
        const context = this.getContext();
        context.speed = speed;
        
        const points = this.applyAffects(x, y, context);
        
        points.forEach(pt => {
            const instance = this.moduleInstances.get(pt.id);
            if (instance) {
                const graphics = instance.onPointMove(pt.x, pt.y, speed, context, pt.style);
                graphics.forEach(g => this.currentStroke?.addChild(g));
            }
        });
        
        // Handle Limit Affect (Tail Pruning)
        // We find if LimitAffect is active (ID: LIMIT)
        const hasLimit = this.activeAffects.some(a => a.name === "Limit");
        if (hasLimit && this.currentStroke) {
             const limitDiff = this.settings?.moduleSettings['LIMIT']?.limit ?? 50;
             
             // Prune Pulse
             while (this.currentStroke.children.length > limitDiff) {
                 const child = this.currentStroke.children[0];
                 child.destroy();
                 this.currentStroke.removeChildAt(0);
             }
        }
    }

    endStroke() {
        if (!this.drawing || !this.currentStroke) return;

        this.drawing = false;
        
        const context = this.getContext();
        
        // Notify all instances
        this.moduleInstances.forEach(instance => {
            instance.onPointUp(context);
        });
        
        // Handle Blindness Reveal
        const hasBlind = this.activeAffects.some(a => a.name === "Blindness");
        
        if (hasBlind && this.currentStroke) {
            const autoRedraw = this.settings?.moduleSettings['BLIND']?.autoRedraw ?? true;
            if (autoRedraw) {
                this.currentStroke.visible = true;
            } else {
                 // Keep hidden
            }
        }
        
        // Index in Spatial Hash
        if (this.currentStroke.visible) {
             if (this.currentStroke.children.length > 0) {
                 this.spatialHash.insert(this.currentStroke);
             }
        }
        
        // Push to history
        if (this.settings?.undoEnabled) {
            this.history.push(this.currentStroke);
            if (this.history.length > 128) {
                const oldest = this.history.shift();
                if (oldest) {
                    this.spatialHash.remove(oldest);
                    oldest.destroy({ children: true });
                }
            }
        }
        
        this.currentStroke = null;
    }
    
    // New method for Manual Redraw
    redrawBlindStrokes() {
        this.container.children.forEach(child => {
            if (!child.visible && (child as any)._blind) {
                child.visible = true;
                // Index it now that it's visible?
                if (child instanceof Container) {
                    this.spatialHash.insert(child);
                }
            }
        });
    }
    
    undo() {
        if (this.history.length === 0) return;
        const last = this.history.pop();
        if (last) {
            this.spatialHash.remove(last);
            last.destroy({ children: true });
        }
    }

    clear() {
        this.history = [];
        this.container.removeChildren();
        this.cursorContainer.removeChildren();
        this.spatialHash.clear();
    }

    async downloadImage(filename: string = 'alchemy-sketch.png') {
        if (!this.app.renderer) return;
        const image = await this.app.renderer.extract.image(this.app.stage);
        const a = document.createElement('a');
        a.href = image.src;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
