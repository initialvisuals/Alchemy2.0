
import type { AffectModule, PointTransform } from './AffectModule';
import type { DrawContext } from './DrawModule';

export class BlindAffect implements AffectModule {
    name = "Blindness";
    
    // Settings
    autoRedraw = true;
    
    // We don't transform points, but we provide settings/identity
    transform(x: number, y: number, _context: DrawContext): PointTransform[] {
        return [{ id: 'blind', x, y }];
    }
}
