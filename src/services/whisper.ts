import { pipeline, env } from '@xenova/transformers';
import type { WhisperModelConfig, ModelLoadProgress, InferenceProgress, RecognitionResult } from '../types';

env.allowLocalModels = false;
env.useBrowserCache = true;

export class WhisperService {
  private transcriber: any = null;
  private config: WhisperModelConfig;
  private loadProgressCallback?: (progress: ModelLoadProgress) => void;
  private inferenceProgressCallback?: (progress: InferenceProgress) => void;

  constructor(config: WhisperModelConfig) {
    this.config = config;
  }

  async loadModel(onProgress?: (progress: ModelLoadProgress) => void): Promise<void> {
    this.loadProgressCallback = onProgress;

    try {
      this.loadProgressCallback?.({
        status: 'loading',
        progress: 0,
        file: 'Initializing...'
      });

      this.transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
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

  async transcribe(audioBlob: Blob, language: string = 'auto'): Promise<RecognitionResult> {
    if (!this.transcriber) {
      throw new Error('Model not loaded');
    }

    try {
      this.inferenceProgressCallback?.({
        status: 'preprocessing',
        progress: 10,
        message: 'Processing audio...'
      });

      const result = await this.transcriber(audioBlob, {
        language: language === 'auto' ? undefined : language,
        task: 'transcribe',
        chunk_length_s: this.config.chunkLength,
        stride_length_s: 5,
        return_timestamps: true,
        callback_function: (item: any) => {
          if (item.status === 'processing') {
            this.inferenceProgressCallback?.({
              status: 'decoding',
              progress: 50 + (item.progress || 0) * 0.5,
              message: 'Transcribing...'
            });
          }
        }
      });

      this.inferenceProgressCallback?.({
        status: 'complete',
        progress: 100,
        message: 'Complete'
      });

      return {
        text: result.text || '',
        segments: result.chunks?.map((chunk: any, index: number) => ({
          id: index,
          seek: chunk.seek || 0,
          start: chunk.timestamp[0] || 0,
          end: chunk.timestamp[1] || 0,
          text: chunk.text || '',
          tokens: chunk.tokens || [],
          temperature: 0,
          avg_logprob: 0,
          compression_ratio: 0,
          no_speech_prob: 0
        })) || []
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

  isModelLoaded(): boolean {
    return this.transcriber !== null;
  }

  cleanup(): void {
    this.transcriber = null;
    this.loadProgressCallback = undefined;
    this.inferenceProgressCallback = undefined;
  }
}

export const createWhisperService = (config: WhisperModelConfig) => {
  return new WhisperService(config);
};
