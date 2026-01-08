
import { Text, Container, TextStyle } from 'pixi.js';
import type { DrawModule, DrawContext } from './DrawModule';

export class TypeModule implements DrawModule {
    name = "Type Shapes";
    
    private chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    private lastX = 0;
    private lastY = 0;

    onPointDown(x: number, y: number, context: DrawContext, overrides?: any): Container[] {
        this.lastX = x;
        this.lastY = y;
        return this.createType(x, y, context, overrides);
    }
    
    onPointMove(x: number, y: number, _speed: number, context: DrawContext, overrides?: any): Container[] {
        const dist = Math.hypot(x - this.lastX, y - this.lastY);
        // Spacing based on size?
        const size = (context.settings.lineWeight || 10) * 2;
        
        if (dist > size * 0.5) { // Overlap a bit
             this.lastX = x;
             this.lastY = y;
             return this.createType(x, y, context, overrides);
        }
        return [];
    }
    
    onPointUp(_context: DrawContext): Container[] {
        return [];
    }
    
    private createType(x: number, y: number, context: DrawContext, overrides?: any): Container[] {
        const customChars = context.settings.moduleSettings['TYPE']?.chars;
        const charSet = (customChars && customChars.length > 0) ? customChars : this.chars;
        
        const char = charSet[Math.floor(Math.random() * charSet.length)];
        
        const { settings } = context;
        const jitter = (context.settings.moduleSettings['TYPE']?.jitter ?? 50) / 50;
        const fontSize = (settings.lineWeight || 10) * 3 + (Math.random() * 10 * jitter);
        const alpha = overrides?.alpha ?? settings.opacity;
        const color = overrides?.color ?? settings.foregroundColor;
        
        const style = new TextStyle({
            fontFamily: 'Arial', // Could rely on a "font" setting eventually
            fontSize,
            fill: color,
            fontWeight: 'bold'
        });
        
        const text = new Text({ text: char, style });
        text.alpha = alpha;
        text.anchor.set(0.5);
        text.x = x;
        text.y = y;
        text.rotation = Math.random() * Math.PI * 2;
        
        // Random scale distortion for "Alchemy" feel
        text.scale.set(0.5 + Math.random(), 0.5 + Math.random());
        
        return [text];
    }
    
    renderUI(): any { return null; }
    dispose() {} 
}
