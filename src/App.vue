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
        <div v-if="shouldShowProgress" class="progress-details">
          <div v-if="modelStatus.files && modelStatus.files.length > 0" class="files-progress">
            <div v-for="(file, index) in modelStatus.files" :key="index" class="file-progress-item">
              <div class="file-header">
                <span class="file-name">{{ getShortFileName(file.name) }}</span>
                <span class="file-status">{{ getFileStatusText(file.status) }}</span>
              </div>
              <div class="file-progress-bar">
                <div class="file-progress-fill" :class="file.status" :style="{ width: file.progress + '%' }"></div>
              </div>
              <div class="file-info">
                <span class="file-percent">{{ file.progress.toFixed(1) }}%</span>
                <span class="file-size">{{ formatBytes(file.loaded) }} / {{ formatBytes(file.total) }}</span>
              </div>
            </div>
          </div>
          <div v-if="modelStatus.downloadSpeed || modelStatus.estimatedTime" class="overall-info">
            <span v-if="modelStatus.downloadSpeed" class="speed-item">
              <span class="speed-icon">⚡</span>
              <span class="speed-text">{{ modelStatus.downloadSpeed }}/s</span>
            </span>
            <span v-if="modelStatus.estimatedTime" class="speed-item">
              <span class="time-icon">⏱️</span>
              <span class="time-text">{{ modelStatus.estimatedTime }}</span>
            </span>
          </div>
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
  progress: 0,
  stage: 'initialize',
  fileName: '准备加载模型...',
  downloadSpeed: undefined,
  estimatedTime: undefined
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
    case 'progress':
      return '加载进度...';
    case 'ready':
      return '模型已就绪';
    case 'error':
      return '模型加载失败';
    default:
      return '初始化中...';
  }
});

const shouldShowProgress = computed(() => {
  return modelStatus.value.status === 'loading' || 
         modelStatus.value.status === 'downloading' ||
         modelStatus.value.status === 'idle' ||
         modelStatus.value.status === 'progress';
});

const formatBytes = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const getShortFileName = (fileName: string): string => {
  if (!fileName) return '';
  const parts = fileName.split('/');
  return parts[parts.length - 1];
};

const getFileStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return '等待中';
    case 'loading':
      return '加载中';
    case 'complete':
      return '完成';
    case 'error':
      return '错误';
    default:
      return '';
  }
};

const loadModel = async () => {
  try {
    console.log('[App] Starting model load...');
    await whisperService.loadModel((progress: ModelLoadProgress) => {
      console.log('[App] Model load progress:', progress);
      modelStatus.value = progress;
    });
    console.log('[App] Model load completed');
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
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
}

.status-indicator.downloading .dot {
  background: #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
}

.status-indicator.ready .dot {
  background: #22c55e;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
  animation: none;
}

.status-indicator.error .dot {
  background: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
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
  margin-bottom: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.progress-text {
  min-width: 3.5rem;
  text-align: right;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.progress-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.files-progress {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-progress-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.file-progress-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.file-progress-item .file-name {
  flex: 1;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-status {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: rgba(255, 255, 255, 0.05);
  white-space: nowrap;
}

.file-progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.file-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
  animation: shimmer 2s infinite;
}

.file-progress-fill.loading {
  background: linear-gradient(90deg, #3b82f6, #667eea);
}

.file-progress-fill.complete {
  background: linear-gradient(90deg, #22c55e, #16a34a);
  animation: none;
}

.file-progress-fill.error {
  background: linear-gradient(90deg, #ef4444, #dc2626);
  animation: none;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.file-percent {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.file-size {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Courier New', monospace;
}

.overall-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.speed-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: rgba(102, 126, 234, 0.15);
  border-radius: 0.375rem;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.speed-icon,
.time-icon {
  font-size: 0.875rem;
}

.speed-text,
.time-text {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-family: 'Courier New', monospace;
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
