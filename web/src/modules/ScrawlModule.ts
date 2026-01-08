
import { Graphics, Container } from 'pixi.js';
import type { DrawModule, DrawContext } from './DrawModule';

export class ScrawlModule implements DrawModule {
    name = "Scrawl Shapes";
    private currentGraphics: Graphics | null = null;
    private lastX: number = 0;
    private lastY: number = 0;

    onPointDown(x: number, y: number, context: DrawContext, overrides?: any): Container[] {
        this.currentGraphics = new Graphics();
        this.lastX = x;
        this.lastY = y;
        
        // Setup initial style
        this.setStyle(this.currentGraphics, context, overrides);
        this.currentGraphics.moveTo(x, y);
        
        return [this.currentGraphics];
    }
    
    private setStyle(g: Graphics, context: DrawContext, overrides?: any) {
        const { settings } = context;
        const width = overrides?.width ?? (settings.lineWeight || 1);
        const alpha = overrides?.alpha ?? settings.opacity;
        const color = overrides?.color ?? settings.foregroundColor;
        
        g.setStrokeStyle({ width, color, alpha });
        if (settings.styleMode === 'FILL') {
             g.context.setFillStyle({ color, alpha });
        }
    }
    
    onPointMove(x: number, y: number, _speed: number, context: DrawContext, _overrides?: any): Container[] {
        if (!this.currentGraphics) return [];
        
        const dist = Math.hypot(x - this.lastX, y - this.lastY);
        
        const noiseSetting = context.settings.moduleSettings['SCRAWL']?.noise ?? 10;
        const stepsSetting = context.settings.moduleSettings['SCRAWL']?.steps ?? 5;
        
        // Scrawl steps
        const steps = Math.ceil(dist / stepsSetting); 
        
        for (let i = 0; i < steps; i++) {
             // Random walk towards target
             const noise = noiseSetting;
             const tx = this.lastX + (x - this.lastX) * ((i+1)/steps);
             const ty = this.lastY + (y - this.lastY) * ((i+1)/steps);
             
             const nx = tx + (Math.random() - 0.5) * noise;
             const ny = ty + (Math.random() - 0.5) * noise;
             
             this.currentGraphics.lineTo(nx, ny);
        }
        
        this.currentGraphics.stroke();
        
        this.lastX = x;
        this.lastY = y;
        
        return [];
    }
    
    onPointUp(_context: DrawContext): Container[] {
        this.currentGraphics = null;
        return [];
    }
    
    renderUI(): any { return null; }
    dispose() {} 
}
