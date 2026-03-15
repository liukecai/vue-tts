<template>
  <div class="voice-recognition">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="back-link">
          ← 返回首页
        </router-link>
        <h1>🎙️ 语音意图识别</h1>
        <p class="subtitle">基于 Whisper 的语音指令识别系统</p>
      </div>
    </header>

    <main class="main">
      <ModelLoadingProgress :model-status="modelStatus" />
      <div v-if="modelStatus.status === 'error'" class="retry-container">
        <button @click="loadModel" class="retry-button">重试</button>
      </div>

      <div class="content">
        <AudioRecorder
          ref="audioRecorder"
          :audio-blob="audioBlob"
          @recording-started="onRecordingStarted"
          @recording-stopped="onAudioReady"
          :disabled="modelStatus.status !== 'ready'"
        />

        <div v-if="recognitionResult" class="result-display">
          <div class="recognition-result">
            <h3>识别结果</h3>
            <p>{{ recognitionResult.text }}</p>
            <div v-if="recognitionResult.intent" class="intent-result">
              <h4>意图识别</h4>
              <p>意图: {{ recognitionResult.intent }}</p>
              <p>执行结果: {{ recognitionResult.executionResult }}</p>
            </div>
          </div>
          <div v-if="isProcessing" class="loading">
            处理中...
          </div>
        </div>
      </div>

      <div class="intent-management">
        <h3>指令管理</h3>
        <div class="intent-list">
          <div v-for="(keywords, intent) in intentMap" :key="intent" class="intent-item">
            <h4>{{ intent }}</h4>
            <div class="keywords">
              <span v-for="(keyword, index) in keywords" :key="index" class="keyword-tag">
                {{ keyword }}
                <button @click="removeKeyword(intent, index)" class="remove-keyword">×</button>
              </span>
            </div>
            <div class="add-keyword">
              <input 
                v-model="newKeywords[intent]" 
                placeholder="添加关键词" 
                @keyup.enter="addKeyword(intent)"
              />
              <button @click="addKeyword(intent)">添加</button>
            </div>
          </div>
        </div>
        
        <div class="add-intent">
          <h4>添加新意图</h4>
          <input v-model="newIntentName" placeholder="意图名称" />
          <input v-model="newIntentKeyword" placeholder="第一个关键词" />
          <button @click="addIntent">添加意图</button>
        </div>
      </div>

      <div class="info-section">
        <h3>使用说明</h3>
        <ul>
          <li>🎤 点击"开始录音"按钮开始录制语音指令</li>
          <li>⏹️ 点击"停止"按钮结束录音</li>
          <li>🎵 录音停止后可以回放音频</li>
          <li>🤖 系统将自动识别语音并匹配意图</li>
          <li>📋 可以在指令管理中添加或修改指令</li>
        </ul>
        <div class="tips">
          <p>💡 <strong>提示:</strong> 首次使用时需要加载本地模型文件，请稍等片刻。</p>
          <p>🔧 <strong>自定义指令:</strong> 可以添加新的意图和关键词来扩展系统功能。</p>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>基于 Vue3 + TypeScript + ONNX.js + Whisper 构建</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AudioRecorder from '../components/AudioRecorder.vue';
import ModelLoadingProgress from '../components/ModelLoadingProgress.vue';
import { SherpaOnnxService } from '../services/sherpaOnnxService';
import type { ModelLoadProgress } from '../types';

const audioRecorder = ref<any>(null);
const audioBlob = ref<Blob | null>(null);
const audioUrl = ref<string>('');
const isProcessing = ref(false);
const modelStatus = ref<ModelLoadProgress>({
  status: 'idle',
  progress: 0,
  file: '',
  stage: 'initialize',
  fileName: '准备加载模型...',
  downloadSpeed: undefined,
  estimatedTime: undefined,
  files: []
});
const recognitionResult = ref<{
  text: string;
  intent: string;
  executionResult: string;
} | null>(null);
const service = ref<SherpaOnnxService | null>(null);

// 意图映射表
const intentMap = ref({
  "OPEN_LIGHT": ["开灯", "打开灯", "亮点", "开启照明"],
  "CLOSE_LIGHT": ["关灯", "关闭灯", "灭灯", "熄灯"],
  "PLAYER_NEXT": ["下一首", "切歌", "换一首"],
  "VOLUME_UP": ["大点声", "调高音量", "大声点"]
});

const newKeywords = ref<Record<string, string>>({});
const newIntentName = ref('');
const newIntentKeyword = ref('');

// 加载保存的意图映射
onMounted(async () => {
  const savedIntentMap = localStorage.getItem('intentMap');
  if (savedIntentMap) {
    intentMap.value = JSON.parse(savedIntentMap);
  }
  
  // 自动加载模型
  await loadModel();
});

// 加载模型
const loadModel = async () => {
  modelStatus.value = {
    status: 'loading',
    progress: 0,
    file: 'Initializing...',
    stage: 'initialize',
    fileName: '正在初始化模型...',
    downloadSpeed: undefined,
    estimatedTime: undefined,
    files: []
  };
  
  try {
    service.value = new SherpaOnnxService();
    await service.value.init();
    console.log('Model loaded successfully');
    
    modelStatus.value = {
      status: 'ready',
      progress: 100,
      file: 'Model loaded',
      stage: 'ready',
      fileName: '模型加载完成，可以开始使用',
      downloadSpeed: undefined,
      estimatedTime: undefined,
      files: []
    };
  } catch (error) {
    console.error('Error loading model:', error);
    modelStatus.value = {
      status: 'error',
      progress: 0,
      file: 'Failed to load model',
      stage: 'error',
      fileName: '模型加载失败，请刷新页面重试',
      downloadSpeed: undefined,
      estimatedTime: undefined,
      files: []
    };
  }
};

// 保存意图映射到localStorage
const saveIntentMap = () => {
  localStorage.setItem('intentMap', JSON.stringify(intentMap.value));
};

const onRecordingStarted = () => {
  console.log('Recording started');
};

const onRecordingStopped = () => {
  console.log('Recording stopped');
};

const onAudioReady = async (blob: Blob) => {
  console.log('onAudioReady called with blob:', blob);
  audioBlob.value = blob;
  audioUrl.value = URL.createObjectURL(blob);
  console.log('Audio blob set, starting processAudio');
  // 录音结束后自动识别
  await processAudio();
};

// 处理音频
const processAudio = async () => {
  console.log('processAudio called');
  if (!audioBlob.value) {
    console.log('No audio blob available');
    return;
  }
  
  if (!service.value) {
    console.log('Service not initialized');
    modelStatus.value = {
      status: 'error',
      progress: 0,
      file: 'Service not initialized',
      stage: 'error',
      fileName: '模型未初始化，请刷新页面重试',
      downloadSpeed: undefined,
      estimatedTime: undefined,
      files: []
    };
    return;
  }
  
  console.log('Starting audio processing');
  isProcessing.value = true;
  try {
    // 识别音频
    console.log('Recognizing audio');
    const text = await service.value.recognize(audioBlob.value);
    console.log('Recognition result:', text);
    
    // 意图匹配
    console.log('Parsing intent');
    const intent = parseIntent(text);
    console.log('Intent:', intent);
    const executionResult = executeCommand(intent);
    console.log('Execution result:', executionResult);
    
    // 显示结果
    console.log('Setting recognition result');
    recognitionResult.value = {
      text,
      intent,
      executionResult
    };
    console.log('Recognition result set');
  } catch (error) {
    console.error('Error processing audio:', error);
    recognitionResult.value = {
      text: '识别失败',
      intent: 'UNKNOWN',
      executionResult: '处理失败'
    };
  } finally {
    console.log('Processing complete, setting isProcessing to false');
    isProcessing.value = false;
  }
};

// 意图匹配函数
const parseIntent = (text: string) => {
  for (const [intent, keywords] of Object.entries(intentMap.value)) {
    if (keywords.some(kw => text.includes(kw))) {
      return intent;
    }
  }
  return "UNKNOWN";
};

// 执行命令
const executeCommand = (intent: string) => {
  switch (intent) {
    case "OPEN_LIGHT":
      return "灯光已打开";
    case "CLOSE_LIGHT":
      return "灯光已关闭";
    case "PLAYER_NEXT":
      return "已切换到下一首";
    case "VOLUME_UP":
      return "音量已调高";
    default:
      return "未知指令";
  }
};

// 添加关键词
const addKeyword = (intent: string) => {
  const keyword = newKeywords.value[intent];
  if (keyword) {
    intentMap.value[intent].push(keyword);
    newKeywords.value[intent] = '';
    saveIntentMap();
  }
};

// 移除关键词
const removeKeyword = (intent: string, index: number) => {
  intentMap.value[intent].splice(index, 1);
  saveIntentMap();
};

// 添加新意图
const addIntent = () => {
  if (newIntentName.value && newIntentKeyword.value) {
    intentMap.value[newIntentName.value] = [newIntentKeyword.value];
    newIntentName.value = '';
    newIntentKeyword.value = '';
    saveIntentMap();
  }
};
</script>

<style scoped>
.voice-recognition {
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

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.back-link {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #764ba2;
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

.model-loading-progress {
  margin-bottom: 2rem;
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

.result-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recognition-result {
  padding: 20px;
  border: 2px solid #667eea;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.recognition-result h3 {
  margin: 0 0 15px 0;
  font-size: 1.25rem;
  color: #667eea;
  font-weight: 600;
}

.recognition-result p {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  white-space: pre-wrap;
  word-break: break-word;
}

.intent-result {
  margin-top: 15px;
  padding: 15px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(102, 126, 234, 0.1));
  border-radius: 8px;
  border-left: 4px solid #2196F3;
}

.intent-result h4 {
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: #667eea;
  font-weight: 600;
}

.intent-result p {
  margin: 5px 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
}

.loading {
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.retry-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.retry-button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
}

.intent-management {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 2rem;
}

.intent-management h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}

.intent-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.intent-item {
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
}

.intent-item h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #667eea;
  font-weight: 600;
}

.keywords {
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.remove-keyword {
  margin-left: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.add-keyword {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.add-keyword input {
  flex: 1;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

.add-keyword input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.add-keyword button {
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.add-keyword button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.add-intent {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
}

.add-intent h4 {
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: #667eea;
  font-weight: 600;
}

.add-intent input {
  margin: 5px 0;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  width: 100%;
}

.add-intent input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.add-intent button {
  margin-top: 10px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #9C27B0 0%, #667eea 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.add-intent button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(156, 39, 176, 0.3);
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

@media (max-width: 768px) {
  .back-link {
    position: static;
    transform: none;
    display: inline-block;
    margin-bottom: 1rem;
  }
  
  .header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>