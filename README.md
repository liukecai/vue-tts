# Vue TTS - 浏览器端语音识别应用

基于 Vue3 + TypeScript + Hugging Face Transformers 实现的浏览器端语音识别应用，使用 Whisper Base 模型提供高质量的中文语音识别。

## ✨ 功能特性

### 音频处理
- 🎤 音频录制（开始/暂停/继续/停止）
- 📊 实时录音时长显示
- 🎧 音频播放控制（播放/暂停/停止）
- 📈 播放进度条（支持点击跳转）
- 🎵 音频可视化（Canvas 频谱图）

### 语音识别
- 🤖 使用 Hugging Face Transformers pipeline API
- 🔍 Whisper Base 模型集成（本地加载）
- 🎯 中文识别支持（语言代码：zh）
- ⏱️ 时间戳返回
- 📋 识别结果展示和复制
- 🔄 识别进度显示（预处理/编码/解码/完成）

### 用户界面
- 📦 模型加载状态指示器
- 📈 模型加载进度条
- ⚠️ 错误提示和处理
- 🔄 重试功能
- ✅ 识别完成提示

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **编程语言**: TypeScript
- **构建工具**: Vite
- **AI 模型**: Hugging Face Transformers (Whisper Base)
- **音频处理**: Web Audio API
- **音频录制**: MediaRecorder API
- **路由管理**: Vue Router

## 📁 项目结构

```
vue-tts/
├── src/
│   ├── components/          # Vue 组件
│   ├── services/            # 服务层
│   │   ├── whisperWorker.ts # Whisper 服务实现
│   │   ├── audioRecorder.ts # 音频录制服务
│   │   └── audioProcessor.ts # 音频预处理服务
│   ├── types/               # TypeScript 类型定义
│   ├── App.vue              # 主应用组件
│   └── main.ts             # 应用入口
├── public/
│   ├── models/              # 模型文件目录
│   │   └── whisper-base/    # Whisper Base 模型
├── package.json            # 项目配置和依赖
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 项目说明文档
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📖 使用说明

1. **模型加载**：打开应用后，等待 Whisper Base 模型加载完成（首次加载需要时间）
2. **开始录音**：点击"开始录音"按钮
3. **录制语音**：录制 5-10 秒的中文语音
4. **停止录音**：点击"停止"按钮
5. **查看结果**：等待识别完成，查看识别结果
6. **复制结果**：点击"复制"按钮复制识别文本
7. **重新录音**：点击"重新录音"按钮开始新的录音

## 🎯 技术实现

### 参考项目
- **[Xenova/whisper-web](https://github.com/xenova/whisper-web.git)** - 基于 Transformers.js 的浏览器端语音识别实现，本项目参考了其核心技术架构

### 核心服务 - Whisper Worker

```typescript
// 核心识别逻辑
const result = await transcriber(audioData, {
  language: 'zh',
  task: 'transcribe',
  chunk_length_s: 30,
  stride_length_s: 5,
  return_timestamps: false
});
```

### 音频处理优化

1. **立体声处理**：自动混合左右声道为单声道
2. **音频解码**：使用 AudioContext 确保 16kHz 采样率
3. **参数配置**：使用官方推荐的解码参数
4. **Web Worker**：使用 Worker 线程处理模型推理，避免阻塞主线程

## ⚡ 性能特点

- **模型大小**: Whisper Base (~300MB)
- **首次加载时间**: 2-5 分钟（取决于网络）
- **识别速度**: 5-10 秒音频约 3-8 秒
- **准确率**: 中等偏上（Base 模型）
- **支持语言**: 中文、英文等多种语言

## 📦 依赖包

```json
{
  "dependencies": {
    "@huggingface/transformers": "^3.8.1",
    "onnxruntime-web": "^1.24.3",
    "vue": "^3.5.30",
    "vue-router": "^5.0.3"
  },
  "devDependencies": {
    "@types/node": "^24.12.0",
    "@vitejs/plugin-vue": "^6.0.5",
    "@vue/tsconfig": "^0.9.0",
    "typescript": "~5.9.3",
    "vite": "^8.0.0",
    "vue-tsc": "^3.2.5"
  }
}
```

## 🔒 隐私保护

- **纯前端实现**：无需后端服务器，完全在浏览器中运行
- **本地处理**：音频数据不上传到服务器，完全本地处理
- **离线能力**：模型缓存后，可以离线使用

## 🎨 技术亮点

1. **组件化设计**：代码结构清晰，易于维护和扩展
2. **TypeScript 支持**：完整的类型定义，提高代码质量
3. **Web Worker**：使用 Worker 线程处理模型推理，提高性能
4. **响应式设计**：适配不同屏幕尺寸
5. **错误处理**：完善的错误提示和处理机制

## 🚀 未来改进方向

1. **性能优化**：
   - 进一步优化 Web Worker 性能
   - 考虑使用量化模型减小体积

2. **功能增强**：
   - 添加实时识别功能
   - 支持多语言切换
   - 添加识别结果编辑功能
   - 支持导出为字幕文件

3. **用户体验**：
   - 添加音频可视化增强
   - 添加识别历史记录
   - 添加快捷键支持

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Vue TTS** - 为您提供高质量的浏览器端语音识别体验 🎉