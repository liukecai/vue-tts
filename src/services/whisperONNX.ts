import { pipeline, env } from '@xenova/transformers';
import type { WhisperModelConfig, ModelLoadProgress, InferenceProgress, RecognitionResult } from '../types';

env.allowLocalModels = false;
env.useBrowserCache = true;

export class WhisperTransformersService {
  private pipeline: any;
  private config: WhisperModelConfig;
  private loadProgressCallback?: (progress: ModelLoadProgress) => void;
  private inferenceProgressCallback?: (progress: InferenceProgress) => void;

  constructor(config: WhisperModelConfig) {
    this.config = config;
  }

  async loadModel(onProgress?: (progress: ModelLoadProgress) => void): Promise<void> {
    this.loadProgressCallback = onProgress;

    try {
      console.log('[WhisperTransformers] Starting to load model...');
      console.log('[WhisperTransformers] Current pipeline state:', this.pipeline);
      
      onProgress?.({
        status: 'loading',
        progress: 0,
        file: 'Loading pipeline...'
      });

      this.pipeline = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
        progress_callback: (progress: any) => {
          console.log('[WhisperTransformers] Model load progress:', progress);
          onProgress?.({
            status: progress.status,
            progress: progress.progress || 0,
            file: progress.file
          });
        },
        quantized: false
      });

      console.log('[WhisperTransformers] Model loaded successfully:', this.pipeline);
      
      onProgress?.({
        status: 'ready',
        progress: 100,
        file: 'Model loaded'
      });
    } catch (error) {
      console.error('[WhisperTransformers] Error loading Transformers model:', error);
      onProgress?.({
        status: 'error',
        progress: 0,
        file: 'Failed to load model'
      });
      throw error;
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
    this.loadProgressCallback = undefined;
  }
}

export const createWhisperTransformersService = (config: WhisperModelConfig) => {
  return new WhisperTransformersService(config);
};
