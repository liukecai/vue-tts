<template>
  <div class="model-loading-progress">
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ModelLoadProgress } from '../types';

const props = defineProps<{
  modelStatus: ModelLoadProgress;
}>();

const modelStatusText = computed(() => {
  switch (props.modelStatus.status) {
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
  return props.modelStatus.status === 'loading' || 
         props.modelStatus.status === 'downloading' ||
         props.modelStatus.status === 'idle' ||
         props.modelStatus.status === 'progress';
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
</script>

<style scoped>
.model-loading-progress {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
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

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
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
