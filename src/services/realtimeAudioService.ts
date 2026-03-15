import type { PermissionState } from './audioRecorder';

export interface RealtimeAudioConfig {
  sampleRate?: number;
  bufferSize?: number;
  channels?: number;
}

export class RealtimeAudioService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private audioSource: MediaStreamAudioSourceNode | null = null;
  private audioProcessor: AudioWorkletNode | null = null;
  private isRunning: boolean = false;
  private listeners: Map<string, Set<Function>> = new Map();

  private config: RealtimeAudioConfig = {
    sampleRate: 16000,
    bufferSize: 4096,
    channels: 1
  };

  isBrowserSupported(): boolean {
    return typeof navigator !== 'undefined' &&
           !!navigator.mediaDevices &&
           typeof navigator.mediaDevices.getUserMedia === 'function' &&
           typeof window !== 'undefined' &&
           typeof window.AudioContext === 'function' &&
           typeof AudioWorkletNode === 'function';
  }

  async checkMicrophonePermission(): Promise<PermissionState> {
    if (!this.isBrowserSupported()) {
      return 'unsupported';
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permissionStatus.state as PermissionState;
    } catch (error) {
      console.warn('[RealtimeAudio] Permission query not supported, assuming prompt:', error);
      return 'prompt';
    }
  }

  async requestMicrophonePermission(): Promise<MediaStream> {
    if (!this.isBrowserSupported()) {
      throw new Error('您的浏览器不支持麦克风访问，请使用最新版本的 Chrome、Firefox、Safari 或 Edge 浏览器');
    }

    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error: any) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('麦克风权限被拒绝。请在浏览器设置中允许麦克风访问，然后刷新页面重试');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('未找到麦克风设备，请检查您的麦克风是否已连接');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('无法访问麦克风，可能被其他应用占用');
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        throw new Error('麦克风不支持所需的音频格式');
      } else if (error.name === 'TypeError') {
        throw new Error('无效的音频约束条件');
      } else if (error.name === 'SecurityError') {
        throw new Error('安全错误：请确保使用 HTTPS 协议访问本应用');
      } else {
        throw new Error(`无法访问麦克风：${error.message || '未知错误'}`);
      }
    }
  }

  async start(config?: RealtimeAudioConfig): Promise<void> {
    if (this.isRunning) {
      return;
    }

    try {
      // 应用配置
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // 获取媒体流
      this.mediaStream = await this.requestMicrophonePermission();

      // 创建音频上下文
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate
      });

      // 加载 AudioWorklet 模块
      await this.audioContext.audioWorklet.addModule('/audio-processor.js');

      // 创建音频源
      this.audioSource = this.audioContext.createMediaStreamSource(this.mediaStream);

      // 创建音频处理器
      this.audioProcessor = new AudioWorkletNode(this.audioContext, 'audio-processor');

      // 处理音频数据
      this.audioProcessor.port.onmessage = (event) => {
        if (event.data.audioData) {
          // 创建一个新的 Float32Array 副本，避免 subarray 错误
          const audioData = new Float32Array(event.data.audioData);
          this.emit('audioData', audioData);
        }
      };

      // 连接音频节点
      this.audioSource.connect(this.audioProcessor);
      this.audioProcessor.connect(this.audioContext.destination);

      this.isRunning = true;
      this.emit('start');
    } catch (error) {
      console.error('Error starting realtime audio:', error);
      throw error;
    }
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    // 断开音频节点
    if (this.audioProcessor) {
      this.audioProcessor.disconnect();
      this.audioProcessor = null;
    }

    if (this.audioSource) {
      this.audioSource.disconnect();
      this.audioSource = null;
    }

    // 关闭音频上下文
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // 停止媒体流
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.isRunning = false;
    this.emit('stop');
  }

  getIsRunning(): boolean {
    return this.isRunning;
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
    this.listeners.clear();
  }
}

export const realtimeAudioService = new RealtimeAudioService();