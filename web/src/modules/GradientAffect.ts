
import type { AffectModule, PointTransform } from './AffectModule';
import type { DrawContext } from './DrawModule';
import { Palette } from 'lucide-react'; // Icon

export class GradientAffect implements AffectModule {
    name = "Gradient";
    icon = Palette;

    transform(x: number, y: number, context: DrawContext): PointTransform[] {
        // Calculate Hue based on position
        // Normalize X/Y 0-1
        const nx = x / context.screenWidth;
        const ny = y / context.screenHeight;
        
        // Diagonal gradient
        const t = (nx + ny) / 2; 
        
        // Hue: 0-360
        const hue = Math.floor(t * 360);
        
        // Convert to Hex
        const color = this.hslToHex(hue, 80, 50); // Sat 80%, Light 50%
        
        return [{
            id: 'main',
            x,
            y,
            style: {
                color: color
            }
        }];
    }

    private hslToHex(h: number, s: number, l: number): string {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
}
