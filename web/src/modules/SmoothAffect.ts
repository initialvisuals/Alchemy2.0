
import type { AffectModule, PointTransform } from './AffectModule';
import type { DrawContext } from './DrawModule';

export class SmoothAffect implements AffectModule {
    name = "Smooth";
    
    // Smoothing Factor (0.0 = No Move, 1.0 = Instant)
    // Lower = Smoother/Laggier
    smoothing = 0.15; 
    
    // State buffer per transform ID
    private history: Map<string, { x: number, y: number }> = new Map();

    transform(x: number, y: number, context: DrawContext): PointTransform[] {
        
        const smoothing = (context.settings.moduleSettings['SMOOTH']?.smoothing ?? 15) / 100;
        // 0.15 default
        // We really only expect 'main' if this is FIRST in the chain.
        // But if it's after mirror, we handle multiple IDs.
        
        // Wait, context doesn't give us the ID being transformed.
        // AffectModule.transform signature is `transform(x, y, context)`.
        // It DOES NOT take the ID as input. 
        // This is a flaw in my pipeline design if I want "Per-ID" stateful effects later in the chain.
        // DrawEngine passes `pt.x` and `pt.y` but discards the input ID or handling uniqueness for the affect step locally.
        
        // Actually DrawEngine does:
        // for (const pt of points) { const transforms = affect.transform(pt.x, pt.y, context); ... }
        
        // The Affect doesn't know WHICH point it is transforming.
        // This means Stateful Affects MUST be first in the chain (operating on 'main' implicitly) 
        // OR I need to update the interface to pass `id` or `index`.
        
        // For "Smooth", it is best placed as the VERY FIRST affect, stabilizing the mouse input before it's mirrored/displaced.
        // So I will assume it's operating on the raw input stream.
        // I'll maintain a single state for "main" for now.
        
        const id = 'main'; // Assumption: Smooth works on the source
        let current = this.history.get(id);
        
        if (!current) {
            current = { x, y };
            this.history.set(id, current);
            return [{ id: 'smoothed', x, y }];
        }
        
        // Detect "Teleport" (Start of new stroke?)
        // DrawEngine doesn't explicitly signal start/end to Affects.
        // But if speed is 0 and distance is huge? 
        // Or simpler: If distance > 100? 
        const dx = x - current.x;
        const dy = y - current.y;
        const distSq = dx*dx + dy*dy;
        
        if (distSq > 100000) { // Teleport (e.g. lift mouse and put down far away)
             current.x = x;
             current.y = y;
        } else {
             // Lerp
             current.x += (x - current.x) * smoothing;
             current.y += (y - current.y) * smoothing;
        }
        
        return [{ 
            id: 'smoothed', 
            x: current.x, 
            y: current.y 
        }];
    }
}
