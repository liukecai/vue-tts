import * as ort from 'onnxruntime-web';
import type { WhisperModelConfig } from '../types';

export class ONNXModelService {
  private encoderSession: ort.InferenceSession | null = null;
  private decoderSession: ort.InferenceSession | null = null;
  private config: WhisperModelConfig;
  private isModelLoaded = false;

  constructor(config: WhisperModelConfig) {
    this.config = config;
  }

  async loadModel(onProgress?: (progress: { status: string; progress: number; file?: string }) => void): Promise<void> {
    try {
      onProgress?.({
        status: 'loading',
        progress: 0,
        file: 'Loading encoder model...'
      });

      const encoderModelPath = this.config.encoderPath;
      const encoderResponse = await fetch(encoderModelPath);
      const encoderArrayBuffer = await encoderResponse.arrayBuffer();
      
      onProgress?.({
        status: 'loading',
        progress: 33,
        file: 'Loading decoder model...'
      });

      const decoderModelPath = this.config.decoderPath;
      const decoderResponse = await fetch(decoderModelPath);
      const decoderArrayBuffer = await decoderResponse.arrayBuffer();

      onProgress?.({
        status: 'loading',
        progress: 66,
        file: 'Creating inference sessions...'
      });

      this.encoderSession = await ort.InferenceSession.create(encoderArrayBuffer);
      this.decoderSession = await ort.InferenceSession.create(decoderArrayBuffer);

      this.isModelLoaded = true;

      onProgress?.({
        status: 'ready',
        progress: 100,
        file: 'Model loaded'
      });
    } catch (error) {
      console.error('Error loading ONNX models:', error);
      onProgress?.({
        status: 'error',
        progress: 0,
        file: 'Failed to load model'
      });
      throw error;
    }
  }

  isReady(): boolean {
    return this.isModelLoaded && this.encoderSession !== null && this.decoderSession !== null;
  }

  getEncoderSession(): ort.InferenceSession | null {
    return this.encoderSession;
  }

  getDecoderSession(): ort.InferenceSession | null {
    return this.decoderSession;
  }

  async runEncoder(inputData: Float32Array): Promise<ort.Tensor> {
    if (!this.encoderSession) {
      throw new Error('Encoder session not loaded');
    }

    const inputTensor = new ort.Tensor('float32', inputData, [1, inputData.length]);
    const feeds: Record<string, ort.Tensor> = { 'input_features': inputTensor };

    const results = await this.encoderSession.run(feeds);
    return results.encoder_hidden_states;
  }

  async runDecoder(
    encoderHiddenStates: ort.Tensor,
    audioFeatures: ort.Tensor
  ): Promise<{ tokens: ort.Tensor; output: ort.Tensor }> {
    if (!this.decoderSession) {
      throw new Error('Decoder session not loaded');
    }

    const feeds: Record<string, ort.Tensor> = {
      'encoder_hidden_states': encoderHiddenStates,
      'input_features': audioFeatures
    };

    const results = await this.decoderSession.run(feeds);
    
    return {
      tokens: results.logits,
      output: results.cross_attentions
    };
  }

  async cleanup(): Promise<void> {
    if (this.encoderSession) {
      await this.encoderSession.release();
      this.encoderSession = null;
    }
    if (this.decoderSession) {
      await this.decoderSession.release();
      this.decoderSession = null;
    }
    this.isModelLoaded = false;
  }
}

export const createONNXModelService = (config: WhisperModelConfig) => {
  return new ONNXModelService(config);
};
