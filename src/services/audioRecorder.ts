import type { AudioRecorderState } from '../types';

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

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
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
      throw new Error('Failed to access microphone');
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
