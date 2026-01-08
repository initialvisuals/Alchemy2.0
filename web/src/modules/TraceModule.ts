
import { Container, Graphics, Texture, Color } from 'pixi.js';
import type { DrawContext, DrawModule } from './DrawModule';

export class TraceModule implements DrawModule {
    name = "Trace";
    private texture: Texture | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    
    // Config
    private baseSize: number = 20;
    
    constructor() {
        // We could load a default, but better to wait for user
    }

    loadImage(file: File) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Create offscreen canvas for sampling
                this.canvas = document.createElement('canvas');
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
                if (this.ctx) {
                    this.ctx.drawImage(img, 0, 0);
                }
                
                // Create texture for preview (optional)
                this.texture = Texture.from(img);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
    
    getPixel(x: number, y: number, screenW: number, screenH: number) {
        if (!this.ctx || !this.canvas) return null;
        
        // Map screen coord to image coord
        // Mode 1: Stretch to screen
        const ix = (x / screenW) * this.canvas.width;
        const iy = (y / screenH) * this.canvas.height;
        
        // Wrap/Clamp?
        if (ix < 0 || iy < 0 || ix >= this.canvas.width || iy >= this.canvas.height) return null;
        
        const data = this.ctx.getImageData(Math.floor(ix), Math.floor(iy), 1, 1).data;
        return { r: data[0], g: data[1], b: data[2], a: data[3] };
    }

    renderUI(): any {
        return null; // Handled by ContextSettingsPanel
    }

    onPointDown(x: number, y: number, context: DrawContext): Container[] {
        return this.createTrace(x, y, context);
    }

    onPointMove(x: number, y: number, _speed: number, context: DrawContext): Container[] {
        return this.createTrace(x, y, context);
    }

    onPointUp(_context: DrawContext): Container[] {
        return [];
    }

    private createTrace(x: number, y: number, context: DrawContext): Container[] {
        if (!this.ctx) return [];
        
        const pixel = this.getPixel(x, y, context.screenWidth, context.screenHeight);
        if (!pixel || pixel.a === 0) return [];
        
        const g = new Graphics();
        
        // Color from pixel
        const color = new Color({ r: pixel.r, g: pixel.g, b: pixel.b }).toNumber();
        const size = this.baseSize; // Could modulate size by brightness?
        
        // Simple shape for now (Clone Brush style)
        g.circle(0, 0, size / 2); // Centered
        g.fill({ color, alpha: context.settings.opacity });
        
        g.x = x;
        g.y = y;
        
        return [g];
    }
    
    dispose() {
        this.ctx = null;
        this.canvas = null;
        if (this.texture) this.texture.destroy();
    }
}
