
import type { AffectModule, PointTransform } from './AffectModule';
import type { DrawContext } from './DrawModule'; 

export class MicExpandAffect implements AffectModule {
    name = "Mic Expand";

    transform(x: number, y: number, context: DrawContext): PointTransform[] {
        let scale = 1.0;
        
        if (context.audio && context.audio.isActive) {
            const vol = context.audio.getVolume(); // 0 to 1 usually
            const gain = (context.settings.moduleSettings?.["MIC_EXPAND"]?.gain || 1.0) * 5.0; // Boost it
            
            // Map volume to scale. 
            // 0 vol -> 1.0 scale
            // 1 vol -> 1 + gain
            scale = 1.0 + (vol * gain);
        }
        
        return [{
            id: 'main',
            x,
            y,
            style: {
                width: scale * 2.0 // Multiplier for existing width
            }
        }];
    }
}
