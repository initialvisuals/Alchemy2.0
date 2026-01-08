
import { Graphics, Container } from 'pixi.js';
import type { DrawModule, DrawContext } from './DrawModule';

export class MedianModule implements DrawModule {
    name = "Median Shapes";
    
    // Stores the PREVIOUS stroke's path (points)
    private previousPath: {x:number, y:number}[] = [];
    private currentPath: {x:number, y:number}[] = [];
    
    private currentGraphics: Graphics | null = null;
    private pointIndex: number = 0;

    onPointDown(x: number, y: number, context: DrawContext, overrides?: any): Container[] {
        this.currentPath = [];
        this.currentPath.push({x, y});
        this.pointIndex = 0;
        
        this.currentGraphics = new Graphics();
        this.updateStyle(this.currentGraphics, context, overrides);
        
        // Start point: Median of Current(Start) and Previous(Start)
        // If no previous, just start at x,y
        
        const startX = this.getMedianX(x, 0);
        const startY = this.getMedianY(y, 0);
        
        this.currentGraphics.moveTo(startX, startY);
        
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
    
    onPointMove(x: number, y: number, _speed: number, _context: DrawContext, _overrides?: any): Container[] {
        if (!this.currentGraphics) return [];
        
        this.currentPath.push({x, y});
        this.pointIndex++;
        
        // Find corresponding point on previous path
        // We simply map by INDEX for now (classic Alchemy glitchiness)
        // If previous path is shorter, we clamp to end.
        
        const medX = this.getMedianX(x, this.pointIndex);
        const medY = this.getMedianY(y, this.pointIndex);
        
        this.currentGraphics.lineTo(medX, medY);
        this.currentGraphics.stroke();
        
        return [];
    }
    
    onPointUp(_context: DrawContext): Container[] {
        // Store current as previous for next time
        if (this.currentPath.length > 5) { // Only store if meaningful
            this.previousPath = [...this.currentPath];
        }
        this.currentGraphics = null;
        return [];
    }
    
    private getMedianX(currX: number, index: number): number {
        if (this.previousPath.length === 0) return currX;
        const prevPt = this.previousPath[Math.min(index, this.previousPath.length - 1)];
        return (currX + prevPt.x) / 2;
    }

    private getMedianY(currY: number, index: number): number {
        if (this.previousPath.length === 0) return currY;
        const prevPt = this.previousPath[Math.min(index, this.previousPath.length - 1)];
        return (currY + prevPt.y) / 2;
    }
    
    renderUI(): any { return null; }
    dispose() {} 
}
