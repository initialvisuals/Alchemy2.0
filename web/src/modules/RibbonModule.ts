
import { Graphics, Container, Point } from 'pixi.js';
import type { DrawModule, DrawContext } from './DrawModule';

export class RibbonModule implements DrawModule {
    name = "Ribbon Shapes";
    
    // We need to maintain state of the "last perpendiculars" to connect the strip seamlessly?
    // Or just connect quads. Connecting quads is easier but might have gaps if turning hard.
    // For a simple ribbon, quads are fine.
    
    private lastX: number = 0;
    private lastY: number = 0;
    private lastP1: Point | null = null;
    private lastP2: Point | null = null;
    
    // We reuse one graphics object for the whole stroke to ensure it batches?
    // Or returns small segments. Returning small segments allows "Limit" affect to work (tail effect).
    // So distinct segments are better for Alchemy style.
    
    onPointDown(x: number, y: number, _context: DrawContext, _overrides?: any): Container[] {
        this.lastX = x;
        this.lastY = y;
        this.lastP1 = null;
        this.lastP2 = null;
        return [];
    }
    
    onPointMove(x: number, y: number, _speed: number, context: DrawContext, overrides?: any): Container[] {
        const dist = Math.hypot(x - this.lastX, y - this.lastY);
        if (dist < 2) return []; // Too close
        
        const { settings, audio } = context;
        let width = overrides?.width ?? (settings.lineWeight || 10);
        const alpha = overrides?.alpha ?? settings.opacity;
        const color = overrides?.color ?? settings.foregroundColor;

        // Modulate with Mic if enabled
        if (settings.micEnabled && audio?.isActive) {
            width *= (1 + audio.getVolume() * 5);
        }
        
        // Calculate Normal
        const dx = x - this.lastX;
        const dy = y - this.lastY;
        const angle = Math.atan2(dy, dx);
        const normal = angle + Math.PI / 2;
        
        const cos = Math.cos(normal);
        const sin = Math.sin(normal);
        
        const w2 = width / 2;
        
        const p1 = new Point(x + cos * w2, y + sin * w2);
        const p2 = new Point(x - cos * w2, y - sin * w2);
        
        // If first segment, establish "last" points at previous pos with same normal (approx)
        if (!this.lastP1) {
            this.lastP1 = new Point(this.lastX + cos * w2, this.lastY + sin * w2);
            this.lastP2 = new Point(this.lastX - cos * w2, this.lastY - sin * w2);
        }
        
        const g = new Graphics();
        g.context.setFillStyle({ color, alpha });
        
        g.moveTo(this.lastP1.x, this.lastP1.y);
        g.lineTo(p1.x, p1.y);
        g.lineTo(p2.x, p2.y);
        g.lineTo(this.lastP2!.x, this.lastP2!.y);
        g.closePath();
        g.fill();
        
        this.lastX = x;
        this.lastY = y;
        this.lastP1 = p1;
        this.lastP2 = p2;
        
        return [g];
    }
    
    onPointUp(_context: DrawContext): Container[] {
        this.lastP1 = null;
        this.lastP2 = null;
        return [];
    }
    
    renderUI(): any { return null; }
    dispose() {} 
}
