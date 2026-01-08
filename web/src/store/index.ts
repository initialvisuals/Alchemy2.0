import { create } from 'zustand';
import type { AlchemySettings, AppMode, AppAction } from '../types';

interface AppState {
    mode: AppMode;
    activeModule: string;
    action: AppAction;
    settings: AlchemySettings;
    setMode: (mode: AppMode) => void;
    setActiveModule: (moduleId: string) => void;
    triggerAction: (action: AppAction) => void;
    updateSettings: (settings: Partial<AlchemySettings>) => void;
    toggleMirror: () => void;
    engine: any | null; 
    setEngine: (engine: any) => void;
    
    // New Affect helpers
    activeModules: string[];
    toggleModule: (moduleName: string) => void;

    hasInteracted: boolean;
    setHasInteracted: () => void;

    tooltip: string | null;
    setTooltip: (text: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
    mode: 'CREATE',
    activeModule: 'SHAPES', 
    action: 'NONE',
    engine: null,
    
    activeModules: [], // e.g. ['DISPLACE', 'BLIND']
    
    settings: {
        backgroundColor: 0x000000,
        foregroundColor: 0xFFFFFF,
        clearBackground: false,
        isDarkMode: true,
        opacity: 0.5,
        mirror: true,
        mirrorMode: 'HORIZONTAL',
        micEnabled: false,
        undoEnabled: true,
        moduleSettings: {
            SPEED: { speedFactor: 2.0, curved: false },
            MIC: { mode: 'FATTEN', gain: 1.0 }
        },
        styleMode: 'STROKE',
        drawOrder: 'OVER',
        lineWeight: 2,
    },
    setMode: (mode) => set({ mode }),
    setActiveModule: (moduleId: string) => set({ activeModule: moduleId }),
    triggerAction: (action) => set({ action }),
    updateSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
    })),
    toggleMirror: () => set((state) => ({
        settings: { ...state.settings, mirror: !state.settings.mirror }
    })),
    setEngine: (engine) => set({ engine }),
    
    toggleModule: (moduleName) => set((state) => {
        const isActive = state.activeModules.includes(moduleName);
        let newModules = isActive 
            ? state.activeModules.filter(m => m !== moduleName)
            : [...state.activeModules, moduleName];
            
        // Sync legacy settings
        const newSettings = { ...state.settings.moduleSettings };
        newSettings[`${moduleName}_ENABLED`] = !isActive;
        
        let mirrorUpdate = {};
        if (moduleName === 'MIRROR') {
            mirrorUpdate = { mirror: !isActive };
            // If turning on, ensure a mode is set if it was NONE
            if (!isActive && state.settings.mirrorMode === 'NONE') {
                mirrorUpdate = { ...mirrorUpdate, mirrorMode: 'HORIZONTAL' };
            }
        }
        
        return { 
            activeModules: newModules,
            settings: { 
                ...state.settings, 
                moduleSettings: newSettings,
                ...mirrorUpdate
            }
        };
    }),
    
    hasInteracted: false,
    setHasInteracted: () => set({ hasInteracted: true }),

    tooltip: null,
    setTooltip: (text) => set({ tooltip: text })
}));
