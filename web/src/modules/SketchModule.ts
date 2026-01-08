
import { Graphics, Container } from 'pixi.js';
import type { DrawModule, DrawContext } from './DrawModule';

/**
 * The standard Alchemy sketch module.
 * Draws simple lines based on cursor movement.
 */
export class SketchModule implements DrawModule {
    name = "Shapes"; // Classic name
    
    // Instead of reusing one Graphics object, we return a new one on Start, 
    // and then Modify it on Move. 
    // But DrawEngine expects us to return objects to add to the container.
    // So on Down we create and return. On Move we modify the *same* instance (stored in this class)
    // and return empty array (since we added no NEW objects).
    
    private currentGraphics: Graphics | null = null;
    
    renderUI(): any {
        return null;
    }

    onPointDown(x: number, y: number, context: DrawContext, overrides?: any): Container[] {
        this.currentGraphics = new Graphics();
        
        const { settings, audio } = context;
        
        // Initial style
        let width = overrides?.width ?? (settings.lineWeight || 2);
        let alpha = overrides?.alpha ?? settings.opacity;
        let color = overrides?.color ?? settings.foregroundColor;
        
        // Mic affects initial strike
        if (settings.micEnabled && audio?.isActive) {
             const vol = audio.getVolume(); 
             width = 1 + (vol * 20); 
             alpha = Math.min(1.0, settings.opacity + (vol * 0.5));
        }
        
        // State setup
        this.currentGraphics.setStrokeStyle({ 
            width, 
            color: color, 
            alpha 
        });
        
        if (settings.styleMode === 'FILL') {
             this.currentGraphics.context.setFillStyle({
                 color: color,
                 alpha: alpha
             });
        }
        
        this.currentGraphics.moveTo(x, y);
        
        return [this.currentGraphics];
    }
    
    onPointMove(x: number, y: number, _speed: number, context: DrawContext, _overrides?: any): Container[] {
        if (!this.currentGraphics) return [];
        
        this.currentGraphics.lineTo(x, y);
        
        if (context.settings.styleMode === 'FILL') {
             this.currentGraphics.fill();
        } else {
             this.currentGraphics.stroke();
        }
        
        return []; 
    }
    
    onPointUp(_context: DrawContext): Container[] {
        this.currentGraphics = null;
        return [];
    }
}
