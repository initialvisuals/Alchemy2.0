
export type Vector2 = { x: number; y: number };

export type AppMode = 'CREATE' | 'AFFECT' | 'TYPE';
export type AppAction = 'NONE' | 'CLEAR' | 'SAVE' | 'UNDO';
export type MirrorMode = 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'QUAD' | 'RADIAL';

export interface AlchemySettings {
    backgroundColor: number;
    foregroundColor: number;
    clearBackground: boolean; // "Auto Clear"
    mirror: boolean;
    mirrorMode: MirrorMode;
    micEnabled: boolean;
    undoEnabled: boolean;
    isDarkMode: boolean;
    opacity: number;
    // Generic store for module-specific settings
    moduleSettings: Record<string, any>;
    
    // UI / Style
    styleMode: 'STROKE' | 'FILL';
    drawOrder: 'OVER' | 'UNDER';
    lineWeight: number;    
}

export interface Shape {
    id: string;
    type: string;
    points: Vector2[];
    style: {
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
    };
}
