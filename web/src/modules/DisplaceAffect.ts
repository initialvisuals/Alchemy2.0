
import { Container } from 'pixi.js';
import type { AffectModule, PointTransform } from './AffectModule';
import type { DrawContext } from './DrawModule';

export class DisplaceAffect implements AffectModule {
    name = "Displace";
    
    // Settings
    displacement = 50.0; // Max displacement range
    
    transform(x: number, y: number, context: DrawContext): PointTransform[] {
        let dx = 0;
        let dy = 0;
        
        const speed = context.speed || 0;
        
        // Inverse speed factor (clamped)
        // Inverse speed factor (clamped)
        const speedFactor = Math.max(0, 1.0 - (speed / 30)); 
        
        const displacementSetting = context.settings.moduleSettings['DISPLACE']?.displacement ?? 50;

        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const dist = displacementSetting * speedFactor;
        
        dx = Math.cos(angle) * dist;
        dy = Math.sin(angle) * dist;
        
        return [{ 
            id: 'disp', 
            x: x + dx, 
            y: y + dy 
        }];
    }
    
    onRollover(x: number, y: number, strokes: Container[], _context: DrawContext): void {
        const radius = 50;
        const radiusSq = radius * radius;
        
        strokes.forEach(stroke => {
            stroke.children.forEach(child => {
                if (child.x !== undefined && child.y !== undefined) {
                    const dx = child.x - x;
                    const dy = child.y - y;
                    const distSq = dx * dx + dy * dy;
                    
                    if (distSq < radiusSq) {
                         const jitter = 5;
                         child.x += (Math.random() - 0.5) * jitter;
                         child.y += (Math.random() - 0.5) * jitter;
                    }
                }
            });
        });
    }
}
