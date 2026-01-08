
import { Graphics, Container } from 'pixi.js';
import type { DrawModule, DrawContext } from './DrawModule';

export class SplatterModule implements DrawModule {
    name = "Splatter Shapes";

    onPointDown(x: number, y: number, context: DrawContext, overrides?: any): Container[] {
        return this.createSplatter(x, y, context, overrides);
    }
    
    onPointMove(x: number, y: number, speed: number, context: DrawContext, overrides?: any): Container[] {
        // Spawn based on speed
        const chance = Math.min(0.5, speed * 0.05);
        if (Math.random() < chance) {
             return this.createSplatter(x, y, context, overrides);
        }
        return [];
    }
    
    onPointUp(_context: DrawContext): Container[] {
        return [];
    }
    
    private createSplatter(x: number, y: number, context: DrawContext, overrides?: any): Container[] {
        const { settings } = context;
        const g = new Graphics();
        
        const alpha = overrides?.alpha ?? settings.opacity;
        const color = overrides?.color ?? settings.foregroundColor;
        const baseSize = (settings.lineWeight || 5);
        
        g.context.setFillStyle({ color, alpha });
        
        // Main blob
        g.circle(x, y, baseSize * (0.8 + Math.random() * 0.4));
        
        // Smaller droplets
        const droplets = Math.floor(Math.random() * 5);
        for(let i=0; i<droplets; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = baseSize * (1.5 + Math.random() * 2);
            const size = baseSize * (0.1 + Math.random() * 0.3);
            
            g.circle(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, size);
        }
        
        g.fill();
        
        return [g];
    }
    
    renderUI(): any { return null; }
    dispose() {} 
}
