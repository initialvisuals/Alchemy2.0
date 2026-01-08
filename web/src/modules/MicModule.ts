
import { Graphics, Container } from 'pixi.js';
import type { DrawModule, DrawContext } from './DrawModule';

/**
 * Mic Shapes Module.
 * "Uses the sound level from your computers microphone to change how shapes are created."
 */
export class MicModule implements DrawModule {
    name = "Mic Shapes";
    
    private currentGraphics: Graphics | null = null;
    
    renderUI(): any {
        return null;
    }

    onPointDown(x: number, y: number, context: DrawContext): Container[] {
        this.currentGraphics = new Graphics();
        
        const { settings } = context;
        
        // Initial style
        const width = 2;
        this.currentGraphics.setStrokeStyle({ 
            width, 
            color: settings.foregroundColor, 
            alpha: settings.opacity 
        });
        
        this.currentGraphics.moveTo(x, y);
        
        return [this.currentGraphics];
    }
    
    onPointMove(x: number, y: number, _speed: number, context: DrawContext): Container[] {
        if (!this.currentGraphics) return [];
        
        const { audio, settings } = context;
        
        // Get volume (0-1)
        const vol = (settings.micEnabled && audio?.isActive) ? audio.getVolume() : 0;
        
        // Module Settings
        const modSettings = settings.moduleSettings['MIC'] || { mode: 'FATTEN', gain: 1.0 };
        const mode = modSettings.mode || 'FATTEN'; // 'FATTEN' | 'SHAKE'
        const gain = modSettings.gain || 1.0;
        
        // Apply gain to volume
        const effectiveVol = Math.min(1.0, vol * gain * 5); // Multiplier to make it responsive
        
        let targetX = x;
        let targetY = y;
        let width = 2;
        
        if (mode === 'FATTEN') {
            // "More noise creates a fatter line"
            width = 1 + (effectiveVol * 50); // Up to 50px thick
        } else if (mode === 'SHAKE') {
            // "Location of the line is changed... more 'shaken up' line"
            const shakeAmount = effectiveVol * 50; 
            targetX += (Math.random() - 0.5) * shakeAmount;
            targetY += (Math.random() - 0.5) * shakeAmount;
        }

        this.currentGraphics.setStrokeStyle({
            width: width,
            color: settings.foregroundColor,
            alpha: settings.opacity
        });
        
        this.currentGraphics.lineTo(targetX, targetY);
        this.currentGraphics.stroke();
        
        return [];
    }
    
    onPointUp(_context: DrawContext): Container[] {
        this.currentGraphics = null;
        return [];
    }
}
