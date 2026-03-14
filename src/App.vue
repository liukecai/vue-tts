<template>
  <div class="app">
    <header class="header">
      <h1>🎙️ Web 语音识别</h1>
      <p class="subtitle">基于 Whisper 的浏览器端语音转文字</p>
    </header>

    <main class="main">
      <div class="model-status">
        <div class="status-indicator" :class="modelStatus.status">
          <span class="dot"></span>
          <span class="text">{{ modelStatusText }}</span>
        </div>
        <div v-if="modelStatus.status === 'loading' || modelStatus.status === 'downloading'" class="progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: modelStatus.progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ modelStatus.progress }}%</span>
        </div>
      </div>

      <div class="content">
        <AudioRecorder
          :audio-blob="lastAudioBlob"
          @recording-started="onRecordingStarted"
          @recording-stopped="onRecordingStopped"
          @recording-paused="onRecordingPaused"
          @recording-resumed="onRecordingResumed"
          @time-update="onTimeUpdate"
        />

        <ResultDisplay
          :result="recognitionResult"
          :is-loading="isProcessing"
          :loading-message="processingMessage"
          :progress="processingProgress"
          :processing-stage="processingStage"
          :is-error="isError"
          :error-message="errorMessage"
          @retry="onRetry"
          @record-again="onRecordAgain"
        />
      </div>

      <div class="info-section">
        <h3>使用说明</h3>
        <ul>
          <li>🎤 点击"开始录音"按钮开始录制语音</li>
          <li>⏸️ 录音过程中可以暂停或继续</li>
          <li>⏹️ 点击"停止"按钮结束录音</li>
          <li>🎵 录音停止后可以回放音频</li>
          <li>📝 系统将自动识别并显示结果</li>
          <li>📋 点击"复制"按钮可以复制识别结果</li>
        </ul>
        <div class="tips">
          <p>💡 <strong>提示:</strong> 首次使用时需要加载本地模型文件，请稍等片刻。</p>
          <p>🌐 <strong>支持语言:</strong> 支持多种语言的语音识别，包括中文、英文等。</p>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>基于 Vue3 + TypeScript + ONNX.js + Whisper 构建</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import AudioRecorder from './components/AudioRecorder.vue';
import ResultDisplay from './components/ResultDisplay.vue';
import { createWhisperTransformersService } from './services/whisperONNX';
import type { RecognitionResult, ModelLoadProgress, InferenceProgress } from './types';

type RecognitionState = 'idle' | 'processing' | 'success' | 'error' | 'empty';

const whisperService = createWhisperTransformersService({
  encoderPath: '/models/encoder_model.onnx',
  decoderPath: '/models/decoder_model.onnx',
  sampleRate: 16000,
  nMelFilters: 80,
  nFFT: 400,
  hopLength: 160,
  chunkLength: 30
});

const modelStatus = ref<ModelLoadProgress>({
  status: 'idle',
  progress: 0
});

const recognitionResult = ref<RecognitionResult>({
  text: '',
  segments: []
});

const recognitionState = ref<RecognitionState>('idle');
const isProcessing = ref(false);
const processingMessage = ref('');
const processingProgress = ref(0);
const processingStage = ref('');
const isError = ref(false);
const errorMessage = ref('');
const lastAudioBlob = ref<Blob | undefined>(undefined);

const modelStatusText = computed(() => {
  switch (modelStatus.value.status) {
    case 'downloading':
      return '下载模型中...';
    case 'loading':
      return '加载模型中...';
    case 'ready':
      return '模型已就绪';
    case 'error':
      return '模型加载失败';
    default:
      return '初始化中...';
  }
});

const loadModel = async () => {
  try {
    await whisperService.loadModel((progress: ModelLoadProgress) => {
      modelStatus.value = progress;
    });
  } catch (error) {
    console.error('Failed to load model:', error);
    modelStatus.value = {
      status: 'error',
      progress: 0
    };
  }
};

const onRecordingStarted = () => {
  console.log('Recording started');
  recognitionState.value = 'idle';
  isError.value = false;
  errorMessage.value = '';
};

const onRecordingStopped = async (blob: Blob) => {
  console.log('Recording stopped, processing...');
  
  if (modelStatus.value.status !== 'ready') {
    alert('模型尚未加载完成，请稍后再试');
    return;
  }

  lastAudioBlob.value = blob;
  recognitionState.value = 'processing';
  isProcessing.value = true;
  isError.value = false;
  errorMessage.value = '';
  processingMessage.value = '正在处理音频...';
  processingProgress.value = 0;
  processingStage.value = 'preprocessing';

  whisperService.setInferenceProgressCallback((progress: InferenceProgress) => {
    processingProgress.value = progress.progress;
    processingMessage.value = progress.message || '';
    
    if (progress.status === 'preprocessing') {
      processingStage.value = 'preprocessing';
    } else if (progress.status === 'encoding') {
      processingStage.value = 'encoding';
    } else if (progress.status === 'decoding') {
      processingStage.value = 'decoding';
    } else if (progress.status === 'complete') {
      processingStage.value = 'complete';
    }
  });

  try {
    const result = await whisperService.transcribe(blob);
    
    if (!result.text || result.text.trim() === '') {
      recognitionState.value = 'empty';
      recognitionResult.value = {
        text: '',
        segments: []
      };
    } else {
      recognitionState.value = 'success';
      recognitionResult.value = result;
    }
  } catch (error) {
    console.error('Transcription error:', error);
    recognitionState.value = 'error';
    isError.value = true;
    errorMessage.value = error instanceof Error ? error.message : '语音识别过程中发生错误，请重试';
  } finally {
    isProcessing.value = false;
    processingStage.value = '';
  }
};

const onRecordingPaused = () => {
  console.log('Recording paused');
};

const onRecordingResumed = () => {
  console.log('Recording resumed');
};

const onTimeUpdate = (duration: number) => {
  console.log('Duration:', duration);
};

const onRetry = async () => {
  if (lastAudioBlob.value) {
    await onRecordingStopped(lastAudioBlob.value);
  }
};

const onRecordAgain = () => {
  recognitionState.value = 'idle';
  recognitionResult.value = {
    text: '',
    segments: []
  };
  isError.value = false;
  errorMessage.value = '';
  lastAudioBlob.value = undefined;
};

onMounted(() => {
  loadModel();
});

onUnmounted(() => {
  whisperService.cleanup();
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
}

.header {
  text-align: center;
  padding: 2rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}

.main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
  box-sizing: border-box;
}

.model-status {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-indicator .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #6b7280;
  animation: pulse 2s infinite;
}

.status-indicator.loading .dot {
  background: #f59e0b;
}

.status-indicator.downloading .dot {
  background: #3b82f6;
}

.status-indicator.ready .dot {
  background: #22c55e;
  animation: none;
}

.status-indicator.error .dot {
  background: #ef4444;
  animation: none;
}

.status-indicator .text {
  font-weight: 500;
  font-size: 0.9375rem;
}

.progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.progress-text {
  min-width: 3rem;
  text-align: right;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .content {
    grid-template-columns: 1fr 1fr;
  }
}

.info-section {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}

.info-section ul {
  margin: 0 0 1rem 0;
  padding-left: 1.5rem;
  list-style: none;
}

.info-section li {
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.tips {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.tips p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  line-height: 1.5;
}

.tips strong {
  color: #667eea;
}

.footer {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer p {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
