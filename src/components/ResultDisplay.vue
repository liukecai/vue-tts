<template>
  <div class="result-display">
    <div class="result-header">
      <h3>识别结果</h3>
      <button
        v-if="result.text && !isError && !isEmpty"
        @click="copyText"
        class="btn-copy"
        :class="{ copied: copied }"
      >
        <span class="icon">{{ copied ? '✓' : '📋' }}</span>
        <span>{{ copied ? '已复制' : '复制' }}</span>
      </button>
    </div>

    <div class="result-content">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p class="loading-message">{{ loadingMessage }}</p>
        <div v-if="processingStage" class="processing-stage">
          <span class="stage-icon">{{ getStageIcon(processingStage) }}</span>
          <span class="stage-text">{{ getStageText(processingStage) }}</span>
        </div>
        <div v-if="progress > 0" class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          <span class="progress-text">{{ Math.round(progress) }}%</span>
        </div>
      </div>

      <div v-else-if="isError" class="error-result">
        <div class="error-icon">⚠️</div>
        <h4 class="error-title">识别失败</h4>
        <p class="error-message">{{ errorMessage || '语音识别过程中发生错误，请重试' }}</p>
        <div class="error-actions">
          <button @click="$emit('retry')" class="btn-retry">
            <span class="icon">🔄</span>
            <span>重试</span>
          </button>
          <button @click="$emit('record-again')" class="btn-record-again">
            <span class="icon">🎤</span>
            <span>重新录制</span>
          </button>
        </div>
      </div>

      <div v-else-if="isEmpty" class="empty-result">
        <div class="empty-icon">🔇</div>
        <h4 class="empty-title">未识别到语音内容</h4>
        <p class="empty-message">录音可能太短或音量太小，请重新录制</p>
        <button @click="$emit('record-again')" class="btn-record-again">
          <span class="icon">🎤</span>
          <span>重新录制</span>
        </button>
      </div>

      <div v-else-if="result.text" class="text-result">
        <div class="success-banner">
          <span class="success-icon">✓</span>
          <span class="success-text">识别完成</span>
        </div>
        <p class="main-text">{{ result.text }}</p>

        <div v-if="result.segments && result.segments.length > 0" class="segments">
          <h4>分段详情</h4>
          <div
            v-for="(segment, index) in result.segments"
            :key="index"
            class="segment"
          >
            <span class="segment-time">
              [{{ formatTime(segment.start) }} - {{ formatTime(segment.end) }}]
            </span>
            <span class="segment-text">{{ segment.text }}</span>
          </div>
        </div>

        <div v-if="result.language" class="language-info">
          <span class="label">检测语言:</span>
          <span class="value">{{ result.language }}</span>
        </div>
      </div>

      <div v-else class="placeholder">
        <p>🎤 点击"开始录音"按钮开始语音识别</p>
        <p class="hint">录音完成后，系统将自动识别并显示结果</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { RecognitionResult } from '../types';

const props = defineProps<{
  result: RecognitionResult;
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
  processingStage?: string;
  isError?: boolean;
  errorMessage?: string;
}>();

const emit = defineEmits<{
  retry: [];
  'record-again': [];
}>();

const copied = ref(false);

const isEmpty = computed(() => {
  return !props.isLoading && !props.isError && props.result && !props.result.text;
});

const copyText = async () => {
  if (props.result.text) {
    try {
      await navigator.clipboard.writeText(props.result.text);
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }
};

const getStageIcon = (stage: string): string => {
  const icons: Record<string, string> = {
    preprocessing: '🔧',
    encoding: '🧠',
    decoding: '💬',
    complete: '✅'
  };
  return icons[stage] || '⏳';
};

const getStageText = (stage: string): string => {
  const texts: Record<string, string> = {
    preprocessing: '预处理音频...',
    encoding: '编码特征...',
    decoding: '解码文本...',
    complete: '完成'
  };
  return texts[stage] || '处理中...';
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.result-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.result-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
}

.btn-copy {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-copy.copied {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
  color: #22c55e;
}

.btn-copy .icon {
  font-size: 1rem;
}

.result-content {
  min-height: 200px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-message {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.processing-stage {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 0.5rem;
}

.stage-icon {
  font-size: 1.25rem;
}

.stage-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.progress-bar {
  width: 100%;
  max-width: 300px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
  position: relative;
}

.progress-text {
  position: absolute;
  right: 0;
  top: -20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-weight: 600;
}

.error-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.error-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ef4444;
}

.error-message {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-retry,
.btn-record-again {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-record-again {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-record-again:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-retry .icon,
.btn-record-again .icon {
  font-size: 1rem;
}

.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.empty-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.empty-message {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.text-result {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.5rem;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #22c55e;
  border-radius: 50%;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.success-text {
  color: #22c55e;
  font-weight: 600;
  font-size: 0.9375rem;
}

.main-text {
  margin: 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  color: white;
  font-size: 1.125rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.segments {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.segments h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.segment {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  border-left: 3px solid #667eea;
}

.segment-time {
  flex-shrink: 0;
  padding: 0.25rem 0.5rem;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 0.25rem;
  color: #667eea;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.segment-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.language-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  align-self: flex-start;
}

.language-info .label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

.language-info .value {
  color: #667eea;
  font-weight: 600;
  font-size: 0.875rem;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  text-align: center;
}

.placeholder p {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
}

.placeholder p:first-child {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
}

.placeholder .hint {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.4);
}
</style>
