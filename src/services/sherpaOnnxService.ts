import { createWhisperTransformersService } from '../services/whisperONNX';
import type { WhisperModelConfig } from '../types';

export class SherpaOnnxService {
  private service: any = null;

  async init() {
    try {
      // 初始化本地whisper模型
      const config: WhisperModelConfig = {
        model: 'SenseVoiceSmall-onnx',
        language: 'auto',
        task: 'transcribe'
      };
      this.service = createWhisperTransformersService(config);
      await this.service.loadModel();
      console.log('Local Whisper model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ASR:', error);
      throw error;
    }
  }

  async recognize(audioBlob: Blob): Promise<string> {
    if (!this.service || !this.service.isModelLoaded()) {
      throw new Error('ASR not initialized');
    }

    try {
      // 执行识别
      const result = await this.service.transcribe(audioBlob);
      return result.text.trim();
    } catch (error) {
      console.error('Error during recognition:', error);
      throw error;
    }
  }

  async close() {
    // 清理资源
    if (this.service) {
      this.service.cleanup();
      this.service = null;
    }
  }
}