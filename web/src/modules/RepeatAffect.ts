import { Container, Sprite, Graphics } from 'pixi.js';
import type { AffectModule, PointTransform } from './AffectModule';
import type { DrawContext } from './DrawModule';

export class RepeatAffect implements AffectModule {
    name = "Repeat";
    
    transform(x: number, y: number, _context: DrawContext): PointTransform[] {
        // Pass-through for drawing
        return [{ id: 'main', x, y }];
    }
    
    onRollover(_x: number, _y: number, strokes: Container[], context: DrawContext): Container[] {
        const newShapes: Container[] = [];
        const chance = (context.settings.moduleSettings['REPEAT']?.chance ?? 5) / 100; // 0-100 -> 0-1
        
        strokes.forEach(stroke => {
            // Stroke is likely a Container of children (Sprites or Graphics)
            stroke.children.forEach(child => {
                if (Math.random() < chance) {
                    // Clone!
                    let clone: Container | null = null;
                    
                    if (child instanceof Sprite) {
                        clone = new Sprite(child.texture);
                        (clone as Sprite).anchor.copyFrom(child.anchor);
                        (clone as Sprite).tint = child.tint;
                    } else if (child instanceof Graphics) {
                        clone = child.clone();
                    }
                    
                    if (clone) {
                        clone.x = child.x + (Math.random() - 0.5) * 40;
                        clone.y = child.y + (Math.random() - 0.5) * 40;
                        clone.rotation = child.rotation + (Math.random() - 0.5);
                        clone.scale.copyFrom(child.scale);
                        clone.alpha = child.alpha * 0.8; // Decay alpha?
                        
                        newShapes.push(clone);
                    }
                }
            });
        });
        
        return newShapes;
    }
}
