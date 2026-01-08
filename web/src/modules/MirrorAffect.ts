
import type { AffectModule, PointTransform } from './AffectModule';
import type { DrawContext } from './DrawModule';

export class MirrorAffect implements AffectModule {
    name = "Mirror";
    
    transform(x: number, y: number, context: DrawContext): PointTransform[] {
        const { screenWidth, screenHeight } = context;
        // Default to HORIZONTAL if mode is undefined but mirror is true (legacy safety)
        const mode = context.settings.mirrorMode || (context.settings.mirror ? 'HORIZONTAL' : 'NONE');
        
        const transforms: PointTransform[] = [
            { id: 'main', x, y }
        ];

        if (mode === 'NONE' || !context.settings.mirror) {
            return transforms;
        }
        
        if (mode === 'HORIZONTAL') {
             transforms.push({ id: 'm_h', x: screenWidth - x, y: y });
        } else if (mode === 'VERTICAL') {
             transforms.push({ id: 'm_v', x: x, y: screenHeight - y });
        } else if (mode === 'QUAD') {
             transforms.push({ id: 'm_h', x: screenWidth - x, y: y });
             transforms.push({ id: 'm_v', x: x, y: screenHeight - y });
             transforms.push({ id: 'm_hv', x: screenWidth - x, y: screenHeight - y });
        } else if (mode === 'RADIAL') {
            // 8-way symmetry (45 degrees) around center
            const cx = screenWidth / 2;
            const cy = screenHeight / 2;
            const dx = x - cx;
            const dy = y - cy;
            const radius = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx);
            
            const slices = 8;
            const step = (Math.PI * 2) / slices;
            
            for (let i = 1; i < slices; i++) {
                const theta = angle + (step * i);
                transforms.push({
                    id: `m_r${i}`,
                    x: cx + Math.cos(theta) * radius,
                    y: cy + Math.sin(theta) * radius
                });
            }
        }
        
        return transforms;
    }
}
