import { pipeline, env } from '@huggingface/transformers';

// 配置环境变量
env.allowLocalModels = true;
env.useBrowserCache = true;

let transcriber: any = null;

// 处理来自主线程的消息
self.onmessage = async (event) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'LOAD_MODEL':
        await handleLoadModel(payload);
        break;
      case 'TRANSCRIBE':
        await handleTranscribe(payload);
        break;
      case 'CLEANUP':
        handleCleanup();
        break;
      default:
        console.error('Unknown message type:', type);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: { error: (error as Error).message || 'Unknown error' }
    });
  }
};

// 处理模型加载
async function handleLoadModel(payload: any) {
  try {
    self.postMessage({
      type: 'LOAD_PROGRESS',
      payload: {
        status: 'loading',
        progress: 0,
        stage: 'initialize',
        fileName: 'Initializing...',
        downloadSpeed: undefined,
        estimatedTime: undefined
      }
    });

    transcriber = await pipeline('automatic-speech-recognition', '/models/whisper-base', {
      device: 'webgpu',
      dtype: 'q4',
      progress_callback: (progress: any) => {
        self.postMessage({
          type: 'LOAD_PROGRESS',
          payload: {
            status: progress.status,
            progress: progress.progress || 0,
            stage: progress.status,
            fileName: progress.file,
            downloadSpeed: undefined,
            estimatedTime: undefined
          }
        });
      }
    });

    self.postMessage({
      type: 'LOAD_PROGRESS',
      payload: {
        status: 'ready',
        progress: 100,
        stage: 'complete',
        fileName: 'Model loaded',
        downloadSpeed: undefined,
        estimatedTime: undefined
      }
    });

    self.postMessage({
      type: 'MODEL_LOADED'
    });
  } catch (error) {
    self.postMessage({
      type: 'LOAD_PROGRESS',
      payload: {
        status: 'error',
        progress: 0,
        stage: 'error',
        fileName: 'Failed to load model',
        downloadSpeed: undefined,
        estimatedTime: undefined
      }
    });
    throw error;
  }
}

// 处理音频转录
async function handleTranscribe(payload: any) {
  if (!transcriber) {
    throw new Error('Model not loaded');
  }

  const { audioData, language } = payload;

  try {
    self.postMessage({
      type: 'INFERENCE_PROGRESS',
      payload: {
        status: 'preprocessing',
        progress: 10,
        message: 'Processing audio...'
      }
    });

    const result = await transcriber(audioData, {
      language: language === 'auto' ? undefined : language,
      task: 'transcribe',
      chunk_length_s: payload.chunkLength || 30,
      stride_length_s: 5,
      return_timestamps: false
    });

    self.postMessage({
      type: 'INFERENCE_PROGRESS',
      payload: {
        status: 'complete',
        progress: 100,
        message: 'Complete'
      }
    });

    self.postMessage({
      type: 'TRANSCRIBE_RESULT',
      payload: {
        text: result.text || '',
        segments: []
      }
    });
  } catch (error) {
    self.postMessage({
      type: 'INFERENCE_PROGRESS',
      payload: {
        status: 'error',
        progress: 0,
        message: 'Transcription failed'
      }
    });
    throw error;
  }
}

// 处理清理
function handleCleanup() {
  transcriber = null;
  self.postMessage({ type: 'CLEANUP_COMPLETE' });
}
