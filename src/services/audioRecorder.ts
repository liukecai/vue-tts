import type { AudioRecorderState } from '../types';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private timerInterval: number | null = null;

  private state: AudioRecorderState = {
    isRecording: false,
    isPaused: false,
    duration: 0
  };

  private listeners: Map<string, Set<Function>> = new Map();

  isBrowserSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async checkMicrophonePermission(): Promise<PermissionState> {
    if (!this.isBrowserSupported()) {
      return 'unsupported';
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permissionStatus.state as PermissionState;
    } catch (error) {
      console.warn('[AudioRecorder] Permission query not supported, assuming prompt:', error);
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

  async startRecording(): Promise<void> {
    try {
      this.stream = await this.requestMicrophonePermission();
      
      let mimeType = 'audio/webm;codecs=opus';
      
      const supportedTypes = [
        'audio/wav',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4'
      ];
      
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          console.log('[AudioRecorder] Using mimeType:', mimeType);
          break;
        }
      }
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mimeType
      });

      this.audioChunks = [];
      this.startTime = Date.now();
      this.state.isRecording = true;
      this.state.isPaused = false;
      this.state.duration = 0;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.emit('stop');
      };

      this.mediaRecorder.start(100);
      this.startTimer();
      this.emit('stateChange', this.state);
      this.emit('start');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.state.isRecording) {
        const onStop = () => {
          this.mediaRecorder?.removeEventListener('stop', onStop);
          this.stopTimer();
          this.state.isRecording = false;
          this.state.isPaused = false;
          this.emit('stateChange', this.state);
          
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          console.log('[AudioRecorder] Created blob with type:', audioBlob.type);
          resolve(audioBlob);
        };

        this.mediaRecorder.addEventListener('stop', onStop);
        this.mediaRecorder.stop();
        this.stream?.getTracks().forEach(track => track.stop());
      } else {
        resolve(new Blob([]));
      }
    });
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.state.isRecording && !this.state.isPaused) {
      this.mediaRecorder.pause();
      this.state.isPaused = true;
      this.stopTimer();
      this.emit('stateChange', this.state);
      this.emit('pause');
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.state.isRecording && this.state.isPaused) {
      this.mediaRecorder.resume();
      this.state.isPaused = false;
      this.startTimer();
      this.emit('stateChange', this.state);
      this.emit('resume');
    }
  }

  private startTimer(): void {
    this.timerInterval = window.setInterval(() => {
      this.state.duration = (Date.now() - this.startTime) / 1000;
      this.emit('timeUpdate', this.state.duration);
    }, 100);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getState(): AudioRecorderState {
    return { ...this.state };
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
    this.stopTimer();
    this.stream?.getTracks().forEach(track => track.stop());
    this.mediaRecorder = null;
    this.stream = null;
    this.audioChunks = [];
    this.state = {
      isRecording: false,
      isPaused: false,
      duration: 0
    };
    this.listeners.clear();
  }
}

export const audioRecorderService = new AudioRecorderService();
