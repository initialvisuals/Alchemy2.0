
import { Texture } from 'pixi.js';

export class SpriteExtractor {
    
    /**
     * Scans a canvas for distinct unconnected shapes (blobs) and returns them as Pixi Textures.
     * Assumes the background is transparent or white.
     */
    static extract(canvas: HTMLCanvasElement): Texture[] {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return [];
        
        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        const visited = new Uint8Array(width * height);
        const textures: Texture[] = [];
        const minBlobSize = 16; // Pixels
        
        const isContent = (idx: number) => {
             // idx is pixel index (0 to width*height-1)
             // data index is idx * 4
             const a = data[idx * 4 + 3];
             
             // If fully transparent, valid background
             if (a < 10) return false;
             
             return true; 
        };
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                
                if (visited[idx]) continue;
                
                if (isContent(idx)) {
                    // Start Flood Fill
                    const blob = this.floodFill(x, y, width, height, visited, isContent);
                    
                    if (blob.pixelCount > minBlobSize) {
                         // Extract Blob to new canvas
                         const tex = this.createTextureFromBlob(blob, data, width);
                         if (tex) textures.push(tex);
                    }
                } else {
                    visited[idx] = 1; 
                }
            }
        }
        
        return textures;
    }
    
    private static floodFill(startX: number, startY: number, width: number, height: number, visited: Uint8Array, isContent: (idx: number) => boolean) {
        const stack = [startX, startY];
        let minX = startX, maxX = startX, minY = startY, maxY = startY;
        let pixelCount = 0;
        
        // We'll store the indices of the blob to reconstruct it quickly (or just use bounds)
        // Storing all indices might be memory heavy. 
        // We can just get bounds, then re-scan the bounds in the source image strictly for connected pixels?
        // Or simpler: Extract the Rect, clear non-blob pixels?
        // Let's keep a Set of indices for exact masking.
        const indices: number[] = [];
        
        visited[startY * width + startX] = 1;
        
        while (stack.length > 0) {
            const y = stack.pop()!;
            const x = stack.pop()!;
            
            const idx = y * width + x;
            indices.push(idx);
            pixelCount++;
            
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            
            // Neighbors (4-way)
            const neighbors = [
                { nx: x + 1, ny: y },
                { nx: x - 1, ny: y },
                { nx: x, ny: y + 1 },
                { nx: x, ny: y - 1 }
            ];
            
            for (const n of neighbors) {
                if (n.nx >= 0 && n.nx < width && n.ny >= 0 && n.ny < height) {
                    const nIdx = n.ny * width + n.nx;
                    if (!visited[nIdx]) {
                        if (isContent(nIdx)) {
                            visited[nIdx] = 1;
                            stack.push(n.nx, n.ny);
                        } else {
                            visited[nIdx] = 1; // Mark background visited too
                        }
                    }
                }
            }
        }
        
        return { minX, maxX, minY, maxY, pixelCount, indices };
    }
    
    private static createTextureFromBlob(blob: any, sourceData: Uint8ClampedArray, sourceWidth: number): Texture | null {
        const w = blob.maxX - blob.minX + 1;
        const h = blob.maxY - blob.minY + 1;
        
        if (w <= 0 || h <= 0) return null;
        
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        
        const imgData = ctx.createImageData(w, h);
        const data = imgData.data;
        
        // Copy pixels
        // To avoid copying "Unconnected" pixels that happened to be in the bounding box,
        // we check against our indices list.
        // This is O(N_blob * logN) or O(N_box) depending on lookup.
        // A Set for lookup is easiest.
        const indexSet = new Set(blob.indices);
        
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                 const sourceX = blob.minX + x;
                 const sourceY = blob.minY + y;
                 const sourceIdx = sourceY * sourceWidth + sourceX;
                 
                 if (indexSet.has(sourceIdx)) {
                     const targetIdx = (y * w + x) * 4;
                     const sIdx = sourceIdx * 4;
                     data[targetIdx] = sourceData[sIdx];
                     data[targetIdx + 1] = sourceData[sIdx + 1];
                     data[targetIdx + 2] = sourceData[sIdx + 2];
                     data[targetIdx + 3] = sourceData[sIdx + 3];
                 }
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
        return Texture.from(canvas);
    }
}
