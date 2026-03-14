<template>
  <div class="realtime-voice-recognition">
    <header class="header">
      <h1>🎙️ 实时语音识别</h1>
      <p class="subtitle">实时将语音转换为文字</p>
    </header>

    <main class="main">
      <div class="container">
        <div class="status-section">
          <div class="status-indicator" :class="{ 'active': isRecording }"></div>
          <p class="status-text">{{ statusText }}</p>
          <div v-if="!isModelLoaded" class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: loadProgress + '%' }"></div>
            </div>
            <p class="progress-text">{{ Math.round(loadProgress) }}%</p>
          </div>
        </div>

        <div class="result-section">
          <h2>识别结果</h2>
          <div class="result-content" ref="resultContent">
            {{ recognitionResult }}
          </div>
        </div>

        <div class="controls-section">
          <button 
            class="control-btn start-btn" 
            @click="startRecognition"
            :disabled="isRecording"
          >
            开始识别
          </button>
          <button 
            class="control-btn stop-btn" 
            @click="stopRecognition"
            :disabled="!isRecording"
          >
            停止识别
          </button>
          <button 
            class="control-btn reset-btn" 
            @click="resetRecognition"
          >
            重置
          </button>
        </div>

        <div class="info-section">
          <h3>使用说明</h3>
          <ul>
            <li>点击「开始识别」按钮开始实时语音识别</li>
            <li>系统会自动申请麦克风权限</li>
            <li>说话时，识别结果会实时显示在上方</li>
            <li>点击「停止识别」按钮结束识别</li>
            <li>点击「重置」按钮清空识别结果</li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>基于 Vue3 + TypeScript + Whisper 构建</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { createRealtimeWhisperService } from '../services/realtimeWhisperService';
import type { WhisperModelConfig, ModelLoadProgress } from '../types';

// 状态管理
const isRecording = ref(false);
const statusText = ref('加载模型中...');
const recognitionResult = ref('');
const resultContent = ref<HTMLElement>();
const isModelLoaded = ref(false);
const loadProgress = ref(0);

// 实时语音识别服务
const whisperConfig: WhisperModelConfig = {
  model: 'Xenova/whisper-tiny',
  chunkLength: 30,
  language: 'zh'
};

const realtimeWhisperService = createRealtimeWhisperService(whisperConfig);

// 加载模型
const loadModel = async () => {
  try {
    await realtimeWhisperService.loadModel((progress: ModelLoadProgress) => {
      if (progress.status === 'loading' || progress.status === 'downloading') {
        loadProgress.value = progress.progress;
        statusText.value = `加载中: ${progress.file}`;
      } else if (progress.status === 'ready') {
        isModelLoaded.value = true;
        statusText.value = '就绪';
      } else if (progress.status === 'error') {
        statusText.value = '模型加载失败';
      }
    });

    // 设置事件监听器
    realtimeWhisperService.on('result', (result: string) => {
      recognitionResult.value = result;
      // 滚动到底部
      if (resultContent.value) {
        resultContent.value.scrollTop = resultContent.value.scrollHeight;
      }
    });

    realtimeWhisperService.on('start', () => {
      statusText.value = '正在识别...';
    });

    realtimeWhisperService.on('stop', () => {
      statusText.value = '已停止';
    });
  } catch (error) {
    console.error('Error loading model:', error);
    statusText.value = '模型加载失败';
  }
};

// 开始实时语音识别
const startRecognition = async () => {
  if (!isModelLoaded.value) {
    statusText.value = '模型未加载完成';
    return;
  }

  try {
    await realtimeWhisperService.start('zh');
    isRecording.value = true;
  } catch (error) {
    console.error('Error starting recognition:', error);
    statusText.value = '无法开始识别，请检查麦克风权限';
  }
};

// 停止实时语音识别
const stopRecognition = () => {
  realtimeWhisperService.stop();
  isRecording.value = false;
};

// 重置识别结果
const resetRecognition = () => {
  recognitionResult.value = '';
  statusText.value = '就绪';
};

// 组件挂载时加载模型
onMounted(() => {
  loadModel();
});

// 组件卸载时清理资源
onUnmounted(() => {
  realtimeWhisperService.cleanup();
});
</script>

<style scoped>
.realtime-voice-recognition {
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
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
  box-sizing: border-box;
}

.container {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.status-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #666;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #4caf50;
  box-shadow: 0 0 10px #4caf50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.status-text {
  margin: 0;
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.8);
}

.progress-section {
  margin-top: 1rem;
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
}

.result-section {
  margin-bottom: 2rem;
}

.result-section h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.result-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1.5rem;
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 1.125rem;
  line-height: 1.6;
}

.controls-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.control-btn {
  flex: 1;
  min-width: 120px;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.stop-btn {
  background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
  color: white;
}

.stop-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.info-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.info-section ul {
  margin: 0;
  padding-left: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.info-section li {
  margin-bottom: 0.5rem;
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

@media (max-width: 768px) {
  .container {
    padding: 1.5rem;
  }
  
  .controls-section {
    flex-direction: column;
  }
  
  .control-btn {
    width: 100%;
  }
  
  .header h1 {
    font-size: 2rem;
  }
}
</style>