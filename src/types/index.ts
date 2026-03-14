export interface RecognitionResult {
  text: string;
  segments?: RecognitionSegment[];
  language?: string;
}

export interface RecognitionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
}

export interface WhisperModelConfig {
  encoderPath: string;
  decoderPath: string;
  sampleRate: number;
  nMelFilters: number;
  nFFT: number;
  hopLength: number;
  chunkLength: number;
}

export interface ModelLoadProgress {
  status: 'idle' | 'downloading' | 'loading' | 'ready' | 'error' | 'progress';
  progress: number;
  file?: string;
  stage?: 'download' | 'parse' | 'initialize' | 'ready' | 'error';
  fileName?: string;
  downloadSpeed?: string;
  estimatedTime?: string;
  loaded?: number;
  total?: number;
  files?: FileProgress[];
}

export interface FileProgress {
  name: string;
  progress: number;
  loaded: number;
  total: number;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

export interface InferenceProgress {
  status: 'idle' | 'preprocessing' | 'encoding' | 'decoding' | 'complete' | 'error';
  progress: number;
  message?: string;
}
