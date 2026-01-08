
import { Container } from 'pixi.js';

export class SpatialHash<T extends Container> {
    private cellSize: number;
    private buckets: Map<string, Set<T>>;

    constructor(cellSize: number = 100) {
        this.cellSize = cellSize;
        this.buckets = new Map();
    }


    private getKeysForRect(x: number, y: number, width: number, height: number): string[] {
        const startX = Math.floor(x / this.cellSize);
        const startY = Math.floor(y / this.cellSize);
        const endX = Math.floor((x + width) / this.cellSize);
        const endY = Math.floor((y + height) / this.cellSize);

        const keys: string[] = [];
        for (let ix = startX; ix <= endX; ix++) {
            for (let iy = startY; iy <= endY; iy++) {
                keys.push(`${ix}_${iy}`);
            }
        }
        return keys;
    }

    insert(item: T) {
        const bounds = item.getBounds();
        const keys = this.getKeysForRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        for (const key of keys) {
            if (!this.buckets.has(key)) {
                this.buckets.set(key, new Set());
            }
            this.buckets.get(key)!.add(item);
        }
    }

    remove(item: T) {
        // This is expensive if we don't know where it was. 
        // For static shapes that don't move drastically, we re-calculate bounds.
        // Or we just scan all buckets (slow).
        // Optimization: Store keys on the item? 
        // For now, let's assume we use 'insert' only once on creation, and clear() on reset.
        // If an item Moves (e.g. Displace), strictly speaking we should remove and re-insert.
        // But for Alchemy's chaos, maybe we don't care if the hash gets slightly stale 
        // until the next "bake" or we just query liberally.
        
        // Let's implement robust remove using current bounds.
        const bounds = item.getBounds();
        const keys = this.getKeysForRect(bounds.x, bounds.y, bounds.width, bounds.height);
        for (const key of keys) {
            this.buckets.get(key)?.delete(item);
        }
    }

    query(x: number, y: number, width: number, height: number): T[] {
        const keys = this.getKeysForRect(x, y, width, height);
        const results = new Set<T>();

        for (const key of keys) {
            const bucket = this.buckets.get(key);
            if (bucket) {
                for (const item of bucket) {
                    results.add(item);
                }
            }
        }

        return Array.from(results);
    }

    clear() {
        this.buckets.clear();
    }
}
