import { pipeline, env } from '@huggingface/transformers';
import type { WhisperModelConfig, ModelLoadProgress, InferenceProgress, RecognitionResult } from '../types';
import { realtimeAudioService } from './realtimeAudioService';

env.allowLocalModels = true;
env.useBrowserCache = true;

export class RealtimeWhisperService {
  private transcriber: any = null;
  private config: WhisperModelConfig;
  private loadProgressCallback?: (progress: ModelLoadProgress) => void;
  private inferenceProgressCallback?: (progress: InferenceProgress) => void;
  private isRunning: boolean = false;
  private audioBuffer: Float32Array = new Float32Array(0);
  private recognitionResult: string = '';
  private listeners: Map<string, Set<Function>> = new Map();
  private isProcessing: boolean = false;

  constructor(config: WhisperModelConfig) {
    this.config = config;
    this.setupAudioListener();
  }

  private setupAudioListener(): void {
    realtimeAudioService.on('audioData', (audioData: Float32Array) => {
      if (this.isRunning) {
        this.processAudioData(audioData);
      }
    });
  }

  async loadModel(onProgress?: (progress: ModelLoadProgress) => void): Promise<void> {
    this.loadProgressCallback = onProgress;

    try {
      this.loadProgressCallback?.({
        status: 'loading',
        progress: 0,
        file: 'Initializing...'
      });

      this.transcriber = await pipeline('automatic-speech-recognition', '/models/whisper-tiny', {
        progress_callback: (progress: any) => {
          if (progress.status === 'downloading') {
            this.loadProgressCallback?.({
              status: 'downloading',
              progress: progress.progress || 0,
              file: progress.file
            });
          } else if (progress.status === 'loading') {
            this.loadProgressCallback?.({
              status: 'loading',
              progress: progress.progress || 0,
              file: progress.file
            });
          }
        }
      });

      this.loadProgressCallback?.({
        status: 'ready',
        progress: 100,
        file: 'Model loaded'
      });
    } catch (error) {
      console.error('Error loading model:', error);
      this.loadProgressCallback?.({
        status: 'error',
        progress: 0,
        file: 'Failed to load model'
      });
      throw error;
    }
  }

  async start(language: string = 'zh'): Promise<void> {
    if (!this.transcriber) {
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

  private async processAudioData(audioData: Float32Array): Promise<void> {
    // 累积音频数据
    const newBuffer = new Float32Array(this.audioBuffer.length + audioData.length);
    newBuffer.set(this.audioBuffer);
    newBuffer.set(audioData, this.audioBuffer.length);
    this.audioBuffer = newBuffer;

    // 当累积的数据达到一定长度且不在处理中时进行识别
    const minBufferLength = 16000; // 1秒的音频数据
    if (this.audioBuffer.length >= minBufferLength && !this.isProcessing) {
      this.isProcessing = true;
      try {
        // 克隆音频数据，避免在处理过程中被修改
        const audioDataClone = new Float32Array(this.audioBuffer);
        // 使用 setTimeout 让主线程有时间处理 UI 更新
        setTimeout(async () => {
          try {
            const result = await this.transcribe(audioDataClone, 'zh');
            if (result.text) {
              this.recognitionResult += result.text + ' ';
              this.emit('result', this.recognitionResult);
            }
          } catch (error) {
            console.error('Error processing audio data:', error);
          } finally {
            // 清空缓冲区，准备下一段音频
            this.audioBuffer = new Float32Array(0);
            this.isProcessing = false;
          }
        }, 0);
      } catch (error) {
        console.error('Error processing audio data:', error);
        this.audioBuffer = new Float32Array(0);
        this.isProcessing = false;
      }
    }
  }

  private async transcribe(audioData: Float32Array, language: string = 'zh'): Promise<RecognitionResult> {
    if (!this.transcriber) {
      throw new Error('Model not loaded');
    }

    try {
      this.inferenceProgressCallback?.({
        status: 'preprocessing',
        progress: 10,
        message: 'Processing audio...'
      });

      const result = await this.transcriber(audioData, {
        language: language === 'auto' ? undefined : language,
        task: 'transcribe',
        chunk_length_s: this.config.chunkLength,
        stride_length_s: 5,
        return_timestamps: false
      });

      this.inferenceProgressCallback?.({
        status: 'complete',
        progress: 100,
        message: 'Complete'
      });

      return {
        text: result.text || '',
        segments: []
      };
    } catch (error) {
      console.error('Error during transcription:', error);
      this.inferenceProgressCallback?.({
        status: 'error',
        progress: 0,
        message: 'Transcription failed'
      });
      throw error;
    }
  }

  setInferenceProgressCallback(callback: (progress: InferenceProgress) => void): void {
    this.inferenceProgressCallback = callback;
  }

  getIsModelLoaded(): boolean {
    return this.transcriber !== null;
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
    this.transcriber = null;
    this.loadProgressCallback = undefined;
    this.inferenceProgressCallback = undefined;
    this.listeners.clear();
  }
}

export const createRealtimeWhisperService = (config: WhisperModelConfig) => {
  return new RealtimeWhisperService(config);
};