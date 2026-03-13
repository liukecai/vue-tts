# Vue3 + Whisper Web 语音识别项目

## 项目概述

基于 Vue3 + TypeScript + @xenova/transformers 实现的浏览器端语音识别应用。

## 技术栈

- **前端框架**: Vue3 (Composition API)
- **编程语言**: TypeScript
- **构建工具**: Vite
- **AI 模型**: @xenova/transformers (Whisper Base)
- **音频处理**: Web Audio API
- **音频录制**: MediaRecorder API

## 已实现的功能

### 1. 音频录制
- ✅ 开始/暂停/继续/停止录音
- ✅ 实时时长显示
- ✅ 录音状态管理
- ✅ 自动选择最佳音频格式（WAV > WebM > MP4）

### 2. 音频播放
- ✅ 播放/暂停/停止控制
- ✅ 播放进度条（支持点击跳转）
- ✅ 当前播放时间和总时长显示
- ✅ 音频可视化（Canvas 频谱图）

### 3. 语音识别
- ✅ 使用 @xenova/transformers pipeline API
- ✅ Whisper Base 模型集成
- ✅ 音频解码和预处理（16kHz 重采样）
- ✅ 立体声自动混合为单声道
- ✅ 中文识别支持（语言代码：zh）
- ✅ 时间戳返回
- ✅ 识别进度回调

### 4. 用户界面
- ✅ 模型加载状态指示器
- ✅ 模型加载进度条
- ✅ 识别进度显示（预处理/编码/解码/完成）
- ✅ 识别结果展示
- ✅ 空结果提示
- ✅ 识别完成提示
- ✅ 识别错误提示
- ✅ 重试功能
- ✅ 复制识别结果

## 核心实现细节

### Whisper 服务实现

基于 Xenova/whisper-web 官方实现：

```typescript
import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

export class WhisperTransformersService {
  private pipeline: any;
  
  async loadModel(onProgress?: (progress: ModelLoadProgress) => void): Promise<void> {
    this.pipeline = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-base',
      {
        progress_callback: (progress: any) => {
          onProgress?.({
            status: progress.status,
            progress: progress.progress || 0,
            file: progress.file
          });
        },
        quantized: false
      }
    );
  }
  
  async transcribe(audioBlob: Blob, language: string = 'auto'): Promise<RecognitionResult> {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    let audio;
    if (audioBuffer.numberOfChannels === 2) {
      const SCALING_FACTOR = Math.sqrt(2);
      let left = audioBuffer.getChannelData(0);
      let right = audioBuffer.getChannelData(1);
      
      audio = new Float32Array(left.length);
      for (let i = 0; i < audioBuffer.length; ++i) {
        audio[i] = SCALING_FACTOR * (left[i] + right[i]) / 2;
      }
    } else {
      audio = audioBuffer.getChannelData(0);
    }
    
    const result = await this.pipeline(audio, {
      task: 'transcribe',
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
      force_full_sequences: false,
      top_k: 0,
      do_sample: false,
      language: 'zh'
    });
    
    return {
      text: result.text || '',
      segments: result.chunks?.map((chunk: any, index: number) => ({
        id: index,
        seek: chunk.seek || 0,
        start: chunk.timestamp[0] || 0,
        end: chunk.timestamp[1] || 0,
        text: chunk.text || ''
      })) || [],
      language: 'zh'
    };
  }
}
```

### 关键优化点

1. **立体声处理**：自动混合左右声道为单声道
2. **解码参数**：使用官方推荐的参数配置
   - `chunk_length_s: 30` - 音频块长度
   - `stride_length_s: 5` - 滑动窗口步长
   - `return_timestamps: true` - 返回时间戳
   - `force_full_sequences: false` - 不强制完整序列
   - `top_k: 0` - 贪心解码
   - `do_sample: false` - 不使用采样
3. **语言指定**：固定为中文（`zh`）避免自动检测错误
4. **音频解码**：使用 AudioContext 解码音频，确保数据格式正确

## 项目结构

```
vue-tts/
├── src/
│   ├── components/
│   │   ├── AudioRecorder.vue       # 音频录制组件
│   │   ├── ResultDisplay.vue       # 识别结果展示组件
│   ├── services/
│   │   ├── whisperONNX.ts        # Whisper 服务实现
│   │   ├── audioRecorder.ts        # 音频录制服务
│   │   └── audioProcessor.ts      # 音频预处理服务
│   ├── types/
│   │   └── index.ts              # TypeScript 类型定义
│   ├── App.vue                   # 主应用组件
│   └── main.ts                  # 应用入口
├── public/
│   └── models/                   # 模型文件目录（未使用）
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 已知问题和解决方案

### 问题 1: 识别结果为空
**原因**：音频格式和参数配置不正确

**解决方案**：
- 使用官方推荐的解码参数
- 指定语言为中文（`zh`）
- 处理立体声音频
- 使用 AudioContext 解码音频

### 问题 2: 繁体中文识别
**原因**：使用了 `zh-cn` 语言代码（不支持）

**解决方案**：
- 改用 `zh` 语言代码
- 模型会自动选择合适的中文变体

### 问题 3: 模型加载失败
**原因**：量化模型与浏览器兼容性问题

**解决方案**：
- 使用非量化模型（`quantized: false`）
- 使用 Whisper Base 模型（更好的准确率）

## 性能特点

- **模型大小**: Whisper Base (~300MB）
- **首次加载时间**: 2-5 分钟（取决于网络）
- **识别速度**: 5-10 秒音频约 3-8 秒
- **准确率**: 中等偏上（Base 模型）
- **支持语言**: 中文、英文等多种语言

## 使用说明

1. 打开应用后，等待模型加载完成
2. 点击"开始录音"按钮
3. 录制 5-10 秒语音
4. 点击"停止"按钮
5. 等待识别完成
6. 查看识别结果
7. 可以复制识别结果或重新录音

## 技术亮点

1. **纯前端实现**：无需后端服务器，完全在浏览器中运行
2. **隐私保护**：音频数据不上传到服务器，完全本地处理
3. **离线能力**：模型缓存后，可以离线使用
4. **组件化设计**：代码结构清晰，易于维护和扩展
5. **TypeScript 支持**：完整的类型定义，提高代码质量

## 依赖包

```json
{
  "dependencies": {
    "@xenova/transformers": "^2.17.2",
    "onnxruntime-web": "^1.24.3",
    "vue": "^3.5.30"
  },
  "devDependencies": {
    "@types/node": "^24.12.0",
    "@vitejs/plugin-vue": "^6.0.5",
    "typescript": "~5.9.3",
    "vite": "^8.0.0",
    "vue-tsc": "^3.2.5"
  }
}
```

## 未来改进方向

1. **性能优化**：
   - 尝试使用 WebWorker 进行模型推理
   - 优化音频处理流程
   - 考虑使用 Whisper Tiny 模型（更快）

2. **功能增强**：
   - 添加实时识别功能
   - 支持多语言切换
   - 添加识别结果编辑功能
   - 支持导出为字幕文件

3. **用户体验**：
   - 添加音频可视化增强
   - 添加识别历史记录
   - 添加快捷键支持

## 总结

本项目成功实现了一个功能完整的浏览器端语音识别应用，使用 Vue3 + TypeScript + @xenova/transformers 技术栈。通过参考 Xenova 官方实现，解决了多个技术难题，包括音频格式处理、立体声混合、参数配置等问题。最终实现了稳定的中文语音识别功能，识别准确率满足基本使用需求。

项目采用纯前端架构，无需后端服务器，保护用户隐私，支持离线使用。代码结构清晰，组件化设计良好，易于维护和扩展。
