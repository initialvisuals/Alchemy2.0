
import { Container } from 'pixi.js';
import type { AudioProcessor } from '../kernel/AudioProcessor';
import type { AlchemySettings } from '../types';

import type { PointStyle } from './AffectModule';

export interface DrawContext {
    settings: AlchemySettings;
    audio: AudioProcessor | null;
    screenWidth: number;
    screenHeight: number;
    speed?: number; // Added for Affects that rely on speed
    pressure?: number;
}

export interface DrawModule {
    name: string;
    
    // Called when pointer goes down
    onPointDown(x: number, y: number, context: DrawContext, overrides?: PointStyle): Container[];
    
    // Called when pointer moves
    onPointMove(x: number, y: number, speed: number, context: DrawContext, overrides?: PointStyle): Container[];
    
    // Called when pointer goes up
    onPointUp(context: DrawContext): Container[];
    
    // Called when pointer moves WITHOUT button down (for Inverse/Trace)
    onPointHover?(x: number, y: number, context: DrawContext): Container[];
    
    // Cleanup if needed
    dispose?(): void;
    
    // UI for context bar
    renderUI(): any;
}
