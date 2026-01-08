import { Container } from 'pixi.js';
import type { DrawContext } from './DrawModule';

export interface PointStyle { // Overrides for drawing
    color?: string | number;
    alpha?: number;
    width?: number; // Scaling factor or absolute width
}

export interface PointTransform {
    id: string; // Identifier for the "cursor" (e.g. "mirror_1")
    x: number;
    y: number;
    style?: PointStyle; // Optional style override
}

export interface AffectModule {
    name: string;
    
    // Transform a single input point into one or more output points
    // Used for drawing (Create)
    transform(x: number, y: number, context: DrawContext): PointTransform[];
    
    // Optional: Rollover Effect
    // Called when the cursor moves near existing shapes.
    // Can return NEW shapes to add to the canvas.
    onRollover?(x: number, y: number, strokes: Container[], context: DrawContext): Container[] | void;
    
    // Optional: Render UI controls
    renderUI?(): any;
}
