import { pipeline, env } from '@huggingface/transformers';
import type { WhisperModelConfig, ModelLoadProgress, InferenceProgress, RecognitionResult, FileProgress } from '../types';

env.allowLocalModels = true;
env.useBrowserCache = true;

export class WhisperTransformersService {
  private pipeline: any;
  private inferenceProgressCallback?: (progress: InferenceProgress) => void;
  private loadStartTime: number = 0;
  private lastProgressUpdate: number = 0;
  private lastProgressValue: number = 0;
  private fileProgressMap: Map<string, FileProgress> = new Map();

  constructor(_config: WhisperModelConfig) {
    // Config parameter kept for API compatibility
  }

  async loadModel(onProgress?: (progress: ModelLoadProgress) => void): Promise<void> {
    try {
      console.log('[WhisperTransformers] Starting to load model...');
      console.log('[WhisperTransformers] Current pipeline state:', this.pipeline);
      
      this.loadStartTime = Date.now();
      this.lastProgressUpdate = this.loadStartTime;
      this.lastProgressValue = 0;
      this.fileProgressMap.clear();
      
      onProgress?.({
        status: 'loading',
        progress: 0,
        file: 'Initializing...',
        stage: 'initialize',
        fileName: '正在初始化模型加载器...',
        downloadSpeed: undefined,
        estimatedTime: undefined,
        files: []
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));

      this.pipeline = await pipeline('automatic-speech-recognition', '/models/whisper-base', {
        device: 'webgpu',
        dtype: 'fp16',
        progress_callback: (progress: any) => {
          console.log('[WhisperTransformers] Model load progress:', progress);
          
          const currentTime = Date.now();
          const timeElapsed = (currentTime - this.lastProgressUpdate) / 1000;
          const progressValue = progress.progress || 0;
          
          let downloadSpeed: string | undefined;
          let estimatedTime: string | undefined;
          
          if (progress.status === 'downloading' || progress.status === 'loading' || progress.status === 'progress') {
            if (timeElapsed > 0.5 && progressValue > this.lastProgressValue) {
              const progressDiff = progressValue - this.lastProgressValue;
              const speed = progressDiff / timeElapsed;
              downloadSpeed = `${speed.toFixed(1)}%`;
              
              if (speed > 0) {
                const remainingProgress = 100 - progressValue;
                const timeRemaining = remainingProgress / speed;
                estimatedTime = this.formatTime(timeRemaining);
              }
              
              this.lastProgressUpdate = currentTime;
              this.lastProgressValue = progressValue;
            }
          }
          
          const stage = this.mapStatusToStage(progress.status);
          const fileName = progress.file || this.getFileNameForStage(stage);
          
          if (progress.file && progress.loaded !== undefined && progress.total !== undefined) {
            this.updateFileProgress(progress.file, progress.progress, progress.loaded, progress.total);
          }
          
          const files = Array.from(this.fileProgressMap.values());
          const overallProgress = this.calculateOverallProgress(files);
          
          onProgress?.({
            status: progress.status,
            progress: overallProgress,
            file: progress.file,
            stage: stage,
            fileName: fileName,
            downloadSpeed: downloadSpeed,
            estimatedTime: estimatedTime,
            loaded: progress.loaded,
            total: progress.total,
            files: files
          });
        }
      });

      console.log('[WhisperTransformers] Model loaded successfully:', this.pipeline);
      
      onProgress?.({
        status: 'ready',
        progress: 100,
        file: 'Model loaded',
        stage: 'ready',
        fileName: '模型加载完成，可以开始使用',
        downloadSpeed: undefined,
        estimatedTime: undefined,
        files: Array.from(this.fileProgressMap.values())
      });
    } catch (error) {
      console.error('[WhisperTransformers] Error loading Transformers model:', error);
      onProgress?.({
        status: 'error',
        progress: 0,
        file: 'Failed to load model',
        stage: 'error',
        fileName: '模型加载失败，请刷新页面重试',
        downloadSpeed: undefined,
        estimatedTime: undefined,
        files: Array.from(this.fileProgressMap.values())
      });
      throw error;
    }
  }
  
  private updateFileProgress(fileName: string, progress: number, loaded: number, total: number): void {
    const existing = this.fileProgressMap.get(fileName);
    if (existing) {
      existing.progress = progress;
      existing.loaded = loaded;
      existing.total = total;
      existing.status = progress >= 100 ? 'complete' : 'loading';
    } else {
      this.fileProgressMap.set(fileName, {
        name: fileName,
        progress: progress,
        loaded: loaded,
        total: total,
        status: progress >= 100 ? 'complete' : 'loading'
      });
    }
  }
  
  private calculateOverallProgress(files: FileProgress[]): number {
    if (files.length === 0) return 0;
    const totalProgress = files.reduce((sum, file) => sum + file.progress, 0);
    return totalProgress / files.length;
  }
  
  private mapStatusToStage(status: string): 'download' | 'parse' | 'initialize' | 'ready' | 'error' {
    switch (status) {
      case 'downloading':
        return 'download';
      case 'loading':
        return 'parse';
      case 'ready':
        return 'ready';
      case 'error':
        return 'error';
      default:
        return 'initialize';
    }
  }
  
  private getFileNameForStage(stage: 'download' | 'parse' | 'initialize' | 'ready' | 'error'): string {
    switch (stage) {
      case 'download':
        return 'Downloading model files...';
      case 'parse':
        return 'Parsing model files...';
      case 'initialize':
        return 'Initializing model...';
      case 'ready':
        return 'Model ready';
      case 'error':
        return 'Error loading model';
      default:
        return 'Processing...';
    }
  }
  
  private formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.ceil(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.ceil(seconds / 60);
      return `${minutes}m`;
    } else {
      const hours = Math.ceil(seconds / 3600);
      return `${hours}h`;
    }
  }

  async transcribe(audioBlob: Blob, language: string = 'auto'): Promise<RecognitionResult> {
    console.log('[WhisperTransformers] Transcribe called, pipeline state:', this.pipeline);
    console.log('[WhisperTransformers] Pipeline type:', typeof this.pipeline);
    
    if (!this.pipeline) {
      console.error('[WhisperTransformers] Pipeline is null or undefined!');
      throw new Error('Model not loaded');
    }

    this.inferenceProgressCallback?.({
      status: 'preprocessing',
      progress: 10,
      message: 'Processing audio...'
    });

    try {
      console.log('[WhisperTransformers] Starting transcription...');
      console.log('[WhisperTransformers] Audio blob size:', audioBlob.size);
      console.log('[WhisperTransformers] Audio blob type:', audioBlob.type);
      console.log('[WhisperTransformers] Language setting:', language === 'auto' ? 'auto (detect)' : language);
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      console.log('[WhisperTransformers] Audio decoded successfully');
      console.log('[WhisperTransformers] Audio duration:', audioBuffer.duration);
      console.log('[WhisperTransformers] Audio sample rate:', audioBuffer.sampleRate);
      console.log('[WhisperTransformers] Audio channels:', audioBuffer.numberOfChannels);
      
      let audio;
      if (audioBuffer.numberOfChannels === 2) {
        const SCALING_FACTOR = Math.sqrt(2);
        let left = audioBuffer.getChannelData(0);
        let right = audioBuffer.getChannelData(1);
        
        audio = new Float32Array(left.length);
        for (let i = 0; i < audioBuffer.length; ++i) {
          audio[i] = SCALING_FACTOR * (left[i] + right[i]) / 2;
        }
        console.log('[WhisperTransformers] Mixed stereo to mono');
      } else {
        audio = audioBuffer.getChannelData(0);
      }
      
      const rawData = audio;
      console.log('[WhisperTransformers] Raw audio data length:', rawData.length);
      console.log('[WhisperTransformers] Audio max value:', Math.max(...rawData));
      console.log('[WhisperTransformers] Audio min value:', Math.min(...rawData));
      
      const options: any = {
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
        force_full_sequences: false,
        top_k: 0,
        do_sample: false,
        language: 'zh'
      };
      
      console.log('[WhisperTransformers] Pipeline options:', options);
      
      const result = await this.pipeline(audio, options);
      
      console.log('[WhisperTransformers] Transcription result:', result);
      console.log('[WhisperTransformers] Result text:', result.text);
      console.log('[WhisperTransformers] Result chunks:', result.chunks);
      console.log('[WhisperTransformers] Result keys:', Object.keys(result));

      this.inferenceProgressCallback?.({
        status: 'complete',
        progress: 100,
        message: 'Complete'
      });

      const text = result.text || '';
      const segments = result.chunks?.map((chunk: any, index: number) => ({
        id: index,
        seek: chunk.seek || 0,
        start: chunk.timestamp[0] || 0,
        end: chunk.timestamp[1] || 0,
        text: chunk.text || ''
      })) || [];

      return {
        text: text,
        segments: segments,
        language: language === 'auto' ? 'auto' : language
      };
    } catch (error) {
      console.error('[WhisperTransformers] Error during transcription:', error);
      this.inferenceProgressCallback?.({
        status: 'error',
        progress: 0,
        message: 'Transcription failed'
      });
      throw error;
    }
  }

  setInferenceProgressCallback(callback: (progress: InferenceProgress) => void) {
    this.inferenceProgressCallback = callback;
  }

  isModelLoaded(): boolean {
    return this.pipeline !== null;
  }

  cleanup(): void {
    this.pipeline = null;
    this.inferenceProgressCallback = undefined;
  }
}

export const createWhisperTransformersService = (config: WhisperModelConfig) => {
  return new WhisperTransformersService(config);
};
