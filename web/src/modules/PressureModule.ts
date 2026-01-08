
import { Graphics, Container } from 'pixi.js';
import type { DrawModule, DrawContext } from './DrawModule';

export class PressureModule implements DrawModule {
    name = "Pressure Shapes";
    private lastX: number = 0;
    private lastY: number = 0;

    onPointDown(x: number, y: number, _context: DrawContext, _overrides?: any): Container[] {
        // We start a new graphics, but we might break it up into segments to handle varying width?
        // Pixi Graphics lines are constant width. To simulate variable width we need to draw segments or meshes.
        // For simplicity, let's draw continuous segments (blobs) or many small line segments.
        
        // Better: Use "Mesh" rope? No, that's complex for this step.
        // Let's just use circles/blobs for now to simulate a brush, or short line segments.
        
        this.lastX = x;
        this.lastY = y;
        return [];
    }
    
    onPointMove(x: number, y: number, speed: number, context: DrawContext, overrides?: any): Container[] {
        // Get pressure if available. overrides?
        // PointerEvent is not passed directly here unfortunately in current DrawEngine signature.
        // We might need to rely on "speed" as a proxy if pressure isn't passed, 
        // OR update DrawEngine to pass the original event 'pressure'.
        
        // For now, let's use SPEED as a proxy for "Dynamics" if pressure is missing, 
        // essentially making this "Speed Shapes 2.0" but intended for tablet logic later.
        
        // BUT, `UIOverlay` has "Pressure Shapes".
        // Let's implement it as "Thick on slow, Thin on fast" (Ink behavior) for now.
        
        const dist = Math.hypot(x - this.lastX, y - this.lastY);
        if (dist < 2) return [];
        
        const g = new Graphics();
        const { settings } = context;
        
        // Simulated Pressure: Fast = Light pressure (thin), Slow = Heavy pressure (thick)
        // Inverse of speed.
        const simulatedPressure = Math.max(0.1, 1 - (speed * 0.05)); 
        
        let width = overrides?.width ?? (settings.lineWeight || 5) * 2 * simulatedPressure;
        const alpha = overrides?.alpha ?? settings.opacity;
        const color = overrides?.color ?? settings.foregroundColor;
        
        g.setStrokeStyle({ width, color, alpha, cap: 'round' });
        g.moveTo(this.lastX, this.lastY);
        g.lineTo(x, y);
        g.stroke();
        
        this.lastX = x;
        this.lastY = y;
        
        return [g];
    }
    
    onPointUp(_context: DrawContext): Container[] {
        return [];
    }
    
    renderUI(): any { return null; }
    dispose() {} 
}
