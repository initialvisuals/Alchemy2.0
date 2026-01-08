
import type { AffectModule, PointTransform } from './AffectModule';
import type { DrawContext } from './DrawModule'; 

export class LimitAffect implements AffectModule {
    name = "Limit";
    // icon = Gauge;

    // Limit Number of Shapes
    // Acts like a "Snake" or "Tail", removing oldest shapes.
    public maxLimit = 50; // Default limit

    transform(x: number, y: number, _context: DrawContext): PointTransform[] {
        // Pass-through. limit enforcement happens in DrawEngine.
        return [{
            id: 'main',
            x,
            y
        }];
    }
}
