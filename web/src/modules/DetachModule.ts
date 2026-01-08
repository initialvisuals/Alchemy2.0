
import { Graphics, Container } from 'pixi.js';
import type { DrawModule, DrawContext } from './DrawModule';

export class DetachModule implements DrawModule {
    name = "Detach Shapes";
    
    // "Satellite" behavior. 
    // We maintain a virtual position that chases the mouse with delay/spring?
    // Or orbits?
    // Manual says: "Moving independently... Distance slider to set how far detached".
    // Let's implement a simple "Spring Follower" with offset.
    
    private satelliteX: number = 0;
    private satelliteY: number = 0;
    private initialized: boolean = false;
    
    private currentGraphics: Graphics | null = null;

    onPointDown(x: number, y: number, context: DrawContext, overrides?: any): Container[] {
        if (!this.initialized) {
            this.satelliteX = x;
            this.satelliteY = y;
            this.initialized = true;
        }
        
        this.currentGraphics = new Graphics();
        this.updateStyle(this.currentGraphics, context, overrides);
        this.currentGraphics.moveTo(this.satelliteX, this.satelliteY);
        
        return [this.currentGraphics];
    }
    
    private updateStyle(g: Graphics, context: DrawContext, overrides?: any) {
        const { settings } = context;
        g.setStrokeStyle({ 
            width: overrides?.width ?? settings.lineWeight ?? 1, 
            color: overrides?.color ?? settings.foregroundColor, 
            alpha: overrides?.alpha ?? settings.opacity 
        });
    }
    
    onPointMove(x: number, y: number, _speed: number, context: DrawContext, _overrides?: any): Container[] {
        if (!this.currentGraphics) return [];
        
        // Update satellite position
        // "Detach" usually implies a fixed offset or spring.
        // Let's do a noisy spring.
        
        const dx = x - this.satelliteX;
        const dy = y - this.satelliteY;
        
        // Move towards target but with delay (Spring)
        const springVal = (context.settings.moduleSettings['DETACH']?.spring ?? 10) / 100;
        const spring = Math.max(0.01, springVal);
        
        this.satelliteX += dx * spring;
        this.satelliteY += dy * spring;
        
        // Add some noise (detached drift) based on Distance slider
        const distVal = context.settings.moduleSettings['DETACH']?.distance ?? 50;
        const drift = distVal / 10;
        
        this.satelliteX += (Math.random() - 0.5) * drift;
        this.satelliteY += (Math.random() - 0.5) * drift;
        
        this.currentGraphics.lineTo(this.satelliteX, this.satelliteY);
        this.currentGraphics.stroke();
        
        return [];
    }
    
    onPointUp(_context: DrawContext): Container[] {
        this.currentGraphics = null;
        return [];
    }
    
    renderUI(): any { return null; }
    dispose() {} 
}
