
import type { AffectModule, PointTransform } from './AffectModule';
import type { DrawContext } from './DrawModule';

export class RandomAffect implements AffectModule {
    name = "Random";
    
    // Settings
    chaosLevel = 20.0; // Max random offset in pixels
    
    transform(x: number, y: number, context: DrawContext): PointTransform[] {
        // Simple random jitter
        // Legacy code: math.random(bottomEnd, topEnd)
        const chaos = context.settings.moduleSettings['RANDOM']?.chaos ?? 20;
        
        const dx = (Math.random() - 0.5) * chaos * 2;
        const dy = (Math.random() - 0.5) * chaos * 2;
        
        return [{ 
            id: 'rnd', 
            x: x + dx, 
            y: y + dy 
        }];
    }
}
