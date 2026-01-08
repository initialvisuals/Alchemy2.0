
import { Graphics, Container } from 'pixi.js';
import type { DrawModule, DrawContext } from './DrawModule';

export class InverseModule implements DrawModule {
    name = "Inverse Shapes";
    
    // Inverse: Draw on Hover (Mouse Up), STOP on Down? 
    // Or invert color? Manual says "When pen is up it draws, when down it does not".
    
    private lastX: number = 0;
    private lastY: number = 0;
    private hasHovered: boolean = false;

    // We don't do anything on Down/Drag/Up
    onPointDown(_x: number, _y: number, _context: DrawContext, _overrides?: any): Container[] {
        // Stop drawing!
        this.hasHovered = false; 
        return [];
    }
    
    onPointMove(_x: number, _y: number, _speed: number, _context: DrawContext, _overrides?: any): Container[] {
         // Stop drawing!
        return [];
    }
    
    onPointUp(_context: DrawContext): Container[] {
        // Resume drawing on next hover tick
        this.hasHovered = false; // Reset last pos
        return [];
    }
    
    onPointHover(x: number, y: number, context: DrawContext): Container[] {
        if (!this.hasHovered) {
            this.lastX = x;
            this.lastY = y;
            this.hasHovered = true;
            return [];
        }
        
        const dist = Math.hypot(x - this.lastX, y - this.lastY);
        if (dist < 2) return [];
        
        const g = new Graphics();
        const { settings } = context;
        
        g.setStrokeStyle({ 
            width: settings.lineWeight || 1, 
            color: settings.foregroundColor, 
            alpha: settings.opacity 
        });
        
        g.moveTo(this.lastX, this.lastY);
        g.lineTo(x, y);
        g.stroke();
        
        this.lastX = x;
        this.lastY = y;
        
        return [g];
    }
    
    renderUI(): any { return null; }
    dispose() {} 
}
