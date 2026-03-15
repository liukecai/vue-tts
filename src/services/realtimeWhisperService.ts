import type { WhisperModelConfig, ModelLoadProgress, InferenceProgress } from '../types';
import { realtimeAudioService } from './realtimeAudioService';

export class RealtimeWhisperService {
  private worker: Worker | null = null;
  private config: WhisperModelConfig;
  private loadProgressCallback?: (progress: ModelLoadProgress) => void;
  private inferenceProgressCallback?: (progress: InferenceProgress) => void;
  private isRunning: boolean = false;
  private audioBuffer: Float32Array = new Float32Array(0);
  private recognitionResult: string = '';
  private listeners: Map<string, Set<Function>> = new Map();
  private isProcessing: boolean = false;
  private isModelLoaded: boolean = false;

  constructor(config: WhisperModelConfig) {
    this.config = config;
    this.setupAudioListener();
    this.setupWorker();
  }

  private setupAudioListener(): void {
    realtimeAudioService.on('audioData', (audioData: Float32Array) => {
      if (this.isRunning) {
        this.processAudioData(audioData);
      }
    });
  }

  private setupWorker(): void {
    try {
      this.worker = new Worker(new URL('./whisperWorker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (event) => {
        const { type, payload } = event.data;

        switch (type) {
          case 'LOAD_PROGRESS':
            this.loadProgressCallback?.(payload);
            break;
          case 'MODEL_LOADED':
            this.isModelLoaded = true;
            break;
          case 'TRANSCRIBE_RESULT':
            if (payload.text) {
              this.recognitionResult += payload.text + ' ';
              this.emit('result', this.recognitionResult);
            }
            this.isProcessing = false;
            this.audioBuffer = new Float32Array(0);
            break;
          case 'INFERENCE_PROGRESS':
            this.inferenceProgressCallback?.(payload);
            break;
          case 'ERROR':
            console.error('Worker error:', payload.error);
            this.isProcessing = false;
            this.audioBuffer = new Float32Array(0);
            break;
          case 'CLEANUP_COMPLETE':
            break;
          default:
            console.warn('Unknown message from worker:', type);
        }
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.isProcessing = false;
      };
    } catch (error) {
      console.error('Error creating worker:', error);
      throw error;
    }
  }

  async loadModel(onProgress?: (progress: ModelLoadProgress) => void): Promise<void> {
    this.loadProgressCallback = onProgress;

    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    return new Promise((resolve, reject) => {
      const originalOnMessage: ((event: MessageEvent<any>) => void) | null = this.worker!.onmessage;

      this.worker!.onmessage = (event: MessageEvent<any>) => {
        const { type, payload } = event.data;

        if (type === 'LOAD_PROGRESS') {
          this.loadProgressCallback?.(payload);
          if (payload.status === 'ready') {
            this.isModelLoaded = true;
            this.worker!.onmessage = originalOnMessage;
            resolve();
          } else if (payload.status === 'error') {
            this.worker!.onmessage = originalOnMessage;
            reject(new Error('Failed to load model'));
          }
        } else if (type === 'ERROR') {
          this.worker!.onmessage = originalOnMessage;
          reject(new Error(payload.error));
        } else if (originalOnMessage !== null) {
          originalOnMessage(event);
        }
      };

      this.worker!.postMessage({
        type: 'LOAD_MODEL',
        payload: {}
      });
    });
  }

  async start(): Promise<void> {
    if (!this.isModelLoaded) {
      throw new Error('Model not loaded');
    }

    if (this.isRunning) {
      return;
    }

    try {
      this.isRunning = true;
      this.audioBuffer = new Float32Array(0);
      this.recognitionResult = '';
      this.isProcessing = false;

      await realtimeAudioService.start({
        sampleRate: 16000,
        bufferSize: 4096,
        channels: 1
      });

      this.emit('start');
    } catch (error) {
      console.error('Error starting realtime recognition:', error);
      this.isRunning = false;
      throw error;
    }
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    realtimeAudioService.stop();
    this.isRunning = false;
    this.isProcessing = false;
    this.emit('stop', this.recognitionResult);
  }

  private processAudioData(audioData: Float32Array): void {
    // 累积音频数据
    const newBuffer = new Float32Array(this.audioBuffer.length + audioData.length);
    newBuffer.set(this.audioBuffer);
    newBuffer.set(audioData, this.audioBuffer.length);
    this.audioBuffer = newBuffer;

    // 当累积的数据达到一定长度且不在处理中时进行识别
    const minBufferLength = 16000; // 1秒的音频数据
    if (this.audioBuffer.length >= minBufferLength && !this.isProcessing && this.worker) {
      this.isProcessing = true;
      try {
        // 克隆音频数据，避免在处理过程中被修改
        const audioDataClone = new Float32Array(this.audioBuffer);
        
        this.worker.postMessage({
          type: 'TRANSCRIBE',
          payload: {
            audioData: audioDataClone,
            language: 'zh',
            chunkLength: this.config.chunkLength
          }
        });
      } catch (error) {
        console.error('Error processing audio data:', error);
        this.audioBuffer = new Float32Array(0);
        this.isProcessing = false;
      }
    }
  }

  setInferenceProgressCallback(callback: (progress: InferenceProgress) => void): void {
    this.inferenceProgressCallback = callback;
  }

  getIsModelLoaded(): boolean {
    return this.isModelLoaded;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  getRecognitionResult(): string {
    return this.recognitionResult;
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(callback => callback(...args));
  }

  cleanup(): void {
    this.stop();
    if (this.worker) {
      this.worker.postMessage({ type: 'CLEANUP' });
      this.worker.terminate();
      this.worker = null;
    }
    this.isModelLoaded = false;
    this.loadProgressCallback = undefined;
    this.inferenceProgressCallback = undefined;
    this.listeners.clear();
  }
}

export const createRealtimeWhisperService = (config: WhisperModelConfig) => {
  return new RealtimeWhisperService(config);
};