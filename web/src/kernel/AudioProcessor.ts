export class AudioProcessor {
    private context: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private dataArray: Uint8Array | null = null;
    public isActive: boolean = false;

    constructor() {}

    async start() {
        if (this.isActive) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            
            this.context = new window.AudioContext();
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 256;
            
            this.source = this.context.createMediaStreamSource(stream);
            this.source.connect(this.analyser);
            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.isActive = true;
        } catch (e) {
            console.error("Error accessing microphone:", e);
            this.isActive = false;
        }
    }

    stop() {
        if (!this.isActive) return;

        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        
        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }

        if (this.context) {
            this.context.close();
            this.context = null;
        }

        this.isActive = false;
    }

    getVolume(): number {
        if (!this.isActive || !this.analyser || !this.dataArray) return 0;

        // @ts-ignore - mismatch in lib dom vs real world usage for some TS versions
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        
        // Normalize to 0-1 range roughly, input is 0-255
        const average = sum / this.dataArray.length;
        return average / 128.0; 
    }
}
