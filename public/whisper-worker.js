// 使用 CDN 方式导入 transformers 库
importScripts('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0/dist/transformers.min.js');

const { pipeline, env } = window.transformers;

env.allowLocalModels = true;
env.useBrowserCache = true;

let transcriber = null;
let isProcessing = false;

self.onmessage = async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'loadModel':
      await loadModel(data);
      break;
    case 'transcribe':
      await transcribe(data);
      break;
    case 'stop':
      stop();
      break;
    default:
      break;
  }
};

async function loadModel(config) {
  try {
    self.postMessage({ type: 'loadProgress', data: { status: 'loading', progress: 0, file: 'Initializing...' } });

    transcriber = await pipeline('automatic-speech-recognition', '/models/whisper-tiny', {
      progress_callback: (progress) => {
        self.postMessage({ type: 'loadProgress', data: progress });
      }
    });

    self.postMessage({ type: 'loadComplete' });
  } catch (error) {
    console.error('Error loading model:', error);
    self.postMessage({ type: 'loadError', data: error.message });
  }
}

async function transcribe(audioData) {
  if (!transcriber || isProcessing) {
    return;
  }

  try {
    isProcessing = true;
    self.postMessage({ type: 'transcribeProgress', data: { status: 'preprocessing', progress: 10, message: 'Processing audio...' } });

    const result = await transcriber(audioData, {
      language: 'zh',
      task: 'transcribe',
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: false
    });

    self.postMessage({ type: 'transcribeComplete', data: result.text || '' });
  } catch (error) {
    console.error('Error during transcription:', error);
    self.postMessage({ type: 'transcribeError', data: error.message });
  } finally {
    isProcessing = false;
  }
}

function stop() {
  isProcessing = false;
  self.postMessage({ type: 'stopped' });
}
