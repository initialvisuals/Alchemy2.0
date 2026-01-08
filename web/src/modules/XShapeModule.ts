
import { Graphics, Container } from 'pixi.js';
import type { DrawModule, DrawContext } from './DrawModule';

export class XShapeModule implements DrawModule {
    name = "X Shapes";

    // We can reuse a container for strokes if needed, or return individual shapes
    // Legacy Alchemy often dropped individual shapes.
    
    onPointDown(x: number, y: number, context: DrawContext, overrides?: any): Container[] {
        return this.createX(x, y, context, overrides);
    }
    
    onPointMove(x: number, y: number, speed: number, context: DrawContext, overrides?: any): Container[] {
        // Read probability setting from Context Bar (default 50)
        // 50 = 0.5 chance at base.
        // We map 1-100 to probability.
        const prob = (context.settings.moduleSettings['X_SHAPES']?.probability ?? 50) / 50; 
        const baseChance = 0.1 * prob; 
        
        // Higher speed = higher chance to spawn to fill gaps
        const chance = Math.min(0.9, baseChance + (speed * 0.05 * prob));
        
        if (Math.random() < chance) {
             return this.createX(x, y, context, overrides);
        }
        return [];
    }
    
    onPointUp(_context: DrawContext): Container[] {
        return [];
    }
    
    private createX(x: number, y: number, context: DrawContext, overrides?: any): Container[] {
        const { settings } = context;
        const g = new Graphics();
        
        const size = (settings.lineWeight || 2) * 5 + (Math.random() * 10);
        const alpha = overrides?.alpha ?? settings.opacity;
        const color = overrides?.color ?? settings.foregroundColor;
        
        g.setStrokeStyle({ width: settings.lineWeight || 1, color, alpha });
        
        // Random Rotation
        const angle = Math.random() * Math.PI * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        // Draw Cross
        // Line 1
        g.moveTo(x - size * cos, y - size * sin);
        g.lineTo(x + size * cos, y + size * sin);
        
        // Line 2 (Perpendicular-ish)
        const angle2 = angle + Math.PI / 2 + (Math.random() - 0.5); // Slight skew
        const cos2 = Math.cos(angle2);
        const sin2 = Math.sin(angle2);
        
        g.moveTo(x - size * cos2, y - size * sin2);
        g.lineTo(x + size * cos2, y + size * sin2);
        
        if (settings.styleMode === 'FILL') {
             // For fill, maybe we close the loop to make a shard?
             // Or draw a polygon?
             g.clear();
             g.context.setFillStyle({ color, alpha }); // Correct PIXI v8 fill API
             
             // Draw a jagged quad
             g.moveTo(x - size, y - size);
             g.lineTo(x + size, y - size + (Math.random() * 10));
             g.lineTo(x + size, y + size);
             g.lineTo(x - size + (Math.random() * 10), y + size);
             g.closePath();
             g.fill();
        } else {
             g.stroke();
        }

        return [g];
    }
    
    renderUI(): any { return null; }
    dispose() {} 
}
