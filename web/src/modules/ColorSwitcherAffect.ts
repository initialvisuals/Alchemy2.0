
import type { AffectModule, PointTransform } from './AffectModule';
import type { DrawContext } from './DrawModule';

export class ColorSwitcherAffect implements AffectModule {
    name = "Color Switcher";
    
    // We want a new color per stroke? Or per point?
    // StartStrike calls transform on the first point.
    // If we want it per *stroke*, we need to be consistent for the duration of the stroke?
    // But `transform` is stateless per point usually.
    // However, `DrawEngine` creates a new instance of the DrawModule for every "virtual cursor" (id).
    // BUT Affects are shared.
    
    // If I return a random color here, ever single "move" event will generate a new random color 
    // for the same stroke, making it a rainbow strobing line.
    // That sounds VERY Alchemy. Let's do that first.
    
    transform(x: number, y: number, context: DrawContext): PointTransform[] {
        // Random Hex Color
        const prob = (context.settings.moduleSettings['COLOR']?.prob ?? 100) / 100;
        
        // If prob check fails, return point without style change (inherit?)
        // But transform must return point. If no style, it uses default.
        // We want to KEEP previous color if not switching? 
        // Stateless transform makes it hard to "keep" state without a map.
        // For now, simpler: just return random color if prob passes.
        
        // Actually, if we return standard point, it uses FG color.
        
        let color: string | undefined = undefined;
        if (Math.random() < prob) {
             color = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        } else {
             // Use context FG?
             // color = undefined (defaults to FG)
        }
        
        // If we want to HOLD the color, we need state. 
        // Let's just do strobe for now.
        if (!color) return [{ id: 'main', x, y }]; // No style override
        
        return [{
            id: 'main',
            x,
            y,
            style: {
                color: color
            }
        }];
    }
}
