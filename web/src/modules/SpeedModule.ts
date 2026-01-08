
import { Graphics, Container } from 'pixi.js';
import type { DrawModule, DrawContext } from './DrawModule';

/**
 * Speed Shapes Module.
 * "Accentuates the pen speed to create shapes that throw the line beyond the actual pen position."
 */
export class SpeedModule implements DrawModule {
    name = "Speed Shapes";
    
    private currentGraphics: Graphics | null = null;
    private lastX: number = 0;
    private lastY: number = 0;
    
    renderUI(): any {
        return null;
    }

    onPointDown(x: number, y: number, context: DrawContext): Container[] {
        this.currentGraphics = new Graphics();
        this.lastX = x;
        this.lastY = y;
        
        const { settings } = context;
        const width = 2; // Base width
        
        this.currentGraphics.setStrokeStyle({ 
            width, 
            color: settings.foregroundColor, 
            alpha: settings.opacity 
        });
        
        this.currentGraphics.moveTo(x, y);
        
        return [this.currentGraphics];
    }
    
    onPointMove(x: number, y: number, _speed: number, context: DrawContext): Container[] {
        if (!this.currentGraphics) return [];
        
        // Calculate raw velocity based on last point (simple difference)
        const dx = x - this.lastX;
        const dy = y - this.lastY;
        
        // Settings for this module
        // We access specific module settings or fallback
        const modSettings = context.settings.moduleSettings['SPEED'] || { speedFactor: 2.0 };
        const factor = modSettings.speedFactor || 2.0;

        // "Throw the line beyond the actual pen position"
        const throwX = x + (dx * factor);
        const throwY = y + (dy * factor);
        
        this.currentGraphics.lineTo(throwX, throwY);
        this.currentGraphics.stroke();
        
        this.lastX = x;
        this.lastY = y;
        
        return [];
    }
    
    onPointUp(_context: DrawContext): Container[] {
        this.currentGraphics = null;
        return [];
    }
}
