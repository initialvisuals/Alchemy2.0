
import { Container, Sprite, Texture, Graphics } from "pixi.js";
import type { DrawModule, DrawContext } from "./DrawModule";
import * as pdfjsLib from 'pdfjs-dist';
import { Ghost } from "lucide-react";
import { SpriteExtractor } from "../utils/SpriteExtractor";

// Configure PDF Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface LoadedShape {
    texture: Texture;
    width: number;
    height: number;
}

export class PullModule implements DrawModule {
    name = "PULL";
    icon = Ghost;

    // Cache textures
    private shapes: LoadedShape[] = [];
    private allShapes: { set: string, shapes: LoadedShape[] }[] = [];
    
    private loading = false;
    private loaded = false;

    // Drawing state
    private lastPoint: { x: number, y: number } | null = null;
    
    // Settings Cache
    private currentSet: string = "ALL";
    
    constructor() {
        this.loadAssets();
    }

    async loadAssets() {
        if (this.loading || this.loaded) return;
        this.loading = true;
        
        // Define all sources
        const sources = [
            { id: 'BONES', paths: ['/shapes/Bones/Bones-1.pdf', '/shapes/Bones/Bones-2.pdf'] },
            { id: 'CIRCLES', paths: ['/shapes/Circles/Circles.pdf'] },
            { id: 'PARTS', paths: ['/shapes/Parts/Parts.pdf'] },
            { id: 'TANGRAM', paths: ['/shapes/Tanagram/Tangram.pdf'] }
        ];

        try {
            console.log("PullModule: Starting Asset Load");
            
            for (const source of sources) {
                const shapeList: LoadedShape[] = [];
                
                for (const path of source.paths) {
                    const loadingTask = pdfjsLib.getDocument(path);
                    const pdf = await loadingTask.promise;
                    
                    for (let i = 1; i <= pdf.numPages; i++) {
                         // Tangram might need different scale?
                        const scale = source.id === 'TANGRAM' ? 1.0 : 1.5;
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale });
                        
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d', { willReadFrequently: true });
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        
                        if (context) {
                            const renderContext = {
                                canvasContext: context,
                                viewport: viewport
                            };
                            await page.render(renderContext as any).promise;
                            const extractedTextures = SpriteExtractor.extract(canvas);
                            
                            extractedTextures.forEach(texture => {
                                shapeList.push({
                                    texture,
                                    width: texture.width,
                                    height: texture.height
                                });
                            });
                        }
                    }
                }
                
                this.allShapes.push({ set: source.id, shapes: shapeList });
                console.log(`PullModule: Loaded set ${source.id} with ${shapeList.length} shapes`);
            }
            
            this.updateActiveShapes("ALL");
            this.loaded = true;
        } catch (e) {
            console.error("PullModule: Failed to load assets", e);
        } finally {
            this.loading = false;
        }
    }
    
    private updateActiveShapes(set: string) {
        this.currentSet = set;
        if (set === "ALL") {
            this.shapes = this.allShapes.flatMap(s => s.shapes);
        } else {
            const found = this.allShapes.find(s => s.set === set);
            this.shapes = found ? found.shapes : [];
        }
        // Force random shuffle?
    }

    renderUI(): any {
        return null; 
    }

    private stamp(x: number, y: number, context: DrawContext, overrides?: any): Graphics | Sprite | null {
        // Sync settings
        const set = context.settings.moduleSettings?.["PULL_SET"] || "ALL";
        if (this.currentSet !== set) {
            this.updateActiveShapes(set);
        }
        
        if (!this.loaded || this.shapes.length === 0) return null;
        
        // Pick random shape
        const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        
        // Create Sprite
        const sprite = new Sprite(shape.texture);
        sprite.anchor.set(0.5);
        
        // Settings: Scale/Size
        // The slider "PULL_SCALE" (0-100) now represents Size
        const sizeSetting = context.settings.moduleSettings?.["PULL_SCALE"] ?? 50; 
        const baseK = sizeSetting / 100.0;
        
        const baseScale = baseK; 
        const pressureScale = (context.pressure || 1.0);
        
        // Add a little chaos anyway? Or strict size?
        const randomFactor = 0.8 + Math.random() * 0.4;
        
        // Override Scale/Width?
        // If width override is present, use it as a multiplier?
        // Alchemy "Width" usually means Line Weight. 
        // For Pull, maybe "Width" could affect Scale?
        // If Override Width is 1..10, we can use it as multiplier?
        const widthMult = overrides?.width ? (overrides.width / 2.0) : 1.0; 
        
        const scale = baseScale * randomFactor * pressureScale * widthMult;
        
        sprite.scale.set(scale);
        
        // Rotation
        const rotateEnabled = context.settings.moduleSettings?.["PULL_ROTATE"] !== false; 
        if (rotateEnabled) {
             sprite.rotation = Math.random() * Math.PI * 2;
        } else {
            sprite.rotation = 0;
        }
        
        // Color Override (Tint)
        if (overrides?.color) {
            sprite.tint = overrides.color;
        }
        
        // Alpha Override
        const alpha = overrides?.alpha ?? context.settings.opacity;
        sprite.alpha = alpha;
        
        sprite.x = x;
        sprite.y = y;
        
        return sprite;
    }

    onPointDown(x: number, y: number, context: DrawContext, overrides?: any): Container[] {
        this.lastPoint = { x, y };
        const stamp = this.stamp(x, y, context, overrides);
        return stamp ? [stamp] : [];
    }

    onPointMove(x: number, y: number, _speed: number, context: DrawContext, _overrides?: any): Container[] {
        if (!this.lastPoint) {
            this.lastPoint = { x, y };
            return [];
        }
        
        const spacing = context.settings.moduleSettings?.["PULL_SPACING"] || 40;

        // Calculate distance
        const dx = x - this.lastPoint.x;
        const dy = y - this.lastPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > spacing) {
             this.lastPoint = { x, y };
             const stamp = this.stamp(x, y, context);
             return stamp ? [stamp] : [];
        }
        
        return [];
    }

    onPointUp(_context: DrawContext): Container[] {
        this.lastPoint = null;
        return [];
    }
}
