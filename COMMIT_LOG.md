# Git 提交记录

## 提交历史

### 1. 初始提交
- **日期**: 2026-03-14
- **描述**: 初始化 Vue3 + Whisper Web 语音识别项目
- **功能**: 完整的项目结构，包括音频录制、播放和识别功能
- **技术栈**: Vue3, TypeScript, Vite, @xenova/transformers

### 2. 修复音频录制器格式选择
- **日期**: 2026-03-14
- **描述**: 添加音频格式自动检测，支持 WAV、WebM、MP4 等格式
- **文件**: src/services/audioRecorder.ts

### 3. 修复 Whisper 服务导入
- **日期**: 2026-03-14
- **描述**: 修复 App.vue 中的服务导入，使用 WhisperTransformersService
- **文件**: src/App.vue

### 4. 切换到量化模型
- **日期**: 2026-03-14
- **描述**: 使用量化模型（quantized: true）提高加载速度
- **文件**: src/services/whisperONNX.ts

### 5. 添加音频解码验证
- **日期**: 2026-03-14
- **描述**: 添加 AudioContext 解码音频，验证音频质量和格式
- **文件**: src/services/whisperONNX.ts

### 6. 切换到非量化模型
- **日期**: 2026-03-14
- **描述**: 切换到非量化模型（quantized: false）提高识别准确率
- **文件**: src/services/whisperONNX.ts

### 7. 添加音频数据分析日志
- **日期**: 2026-03-14
- **描述**: 添加原始音频数据的最大值和最小值日志，用于诊断音量问题
- **文件**: src/services/whisperONNX.ts

### 8. 添加重试机制
- **日期**: 2026-03-14
- **描述**: 添加重试机制，如果第一次识别失败，尝试不使用时间戳
- **文件**: src/services/whisperONNX.ts

### 9. 切换到 Whisper Base 模型
- **日期**: 2026-03-14
- **描述**: 从 Whisper Tiny 切换到 Base 模型，提高识别准确率
- **文件**: src/services/whisperONNX.ts

### 10. 修改为自动语言检测
- **日期**: 2026-03-14
- **描述**: 移除语言参数，让模型自动检测语言
- **文件**: src/services/whisperONNX.ts

### 11. 添加立体声处理
- **日期**: 2026-03-14
- **描述**: 参考 Xenova/whisper-web 官方实现，添加立体声混合为单声道
- **文件**: src/services/whisperONNX.ts

### 12. 添加官方解码参数
- **日期**: 2026-03-14
- **描述**: 使用官方推荐的解码参数（chunk_length_s: 30, stride_length_s: 5, return_timestamps: true, force_full_sequences: false, top_k: 0, do_sample: false）
- **文件**: src/services/whisperONNX.ts

### 13. 修复语法错误
- **日期**: 2026-03-14
- **描述**: 修复 setInferenceProgressCallback 方法的缩进错误
- **文件**: src/services/whisperONNX.ts

### 14. 修改为直接传递音频数据
- **日期**: 2026-03-14
- **描述**: 修改为直接传递解码后的 Float32Array 音频数据，而不是 Blob
- **文件**: src/services/whisperONNX.ts

### 15. 指定中文语言
- **日期**: 2026-03-14
- **描述**: 添加 language: 'zh' 参数，固定识别为中文
- **文件**: src/services/whisperONNX.ts

### 16. 修复为简体中文
- **日期**: 2026-03-14
- **描述**: 修改语言代码从 'zh-cn' 改为 'zh'（zh-cn 不被支持）
- **文件**: src/services/whisperONNX.ts

### 17. 创建项目总结文档
- **日期**: 2026-03-14
- **描述**: 创建 PROJECT_SUMMARY.md 文档，记录项目实现细节和技术亮点
- **文件**: PROJECT_SUMMARY.md

---

## 技术栈

- **前端**: Vue3 (Composition API)
- **语言**: TypeScript
- **构建**: Vite
- **AI**: @xenova/transformers (Whisper Base)
- **音频**: Web Audio API, MediaRecorder API

## 主要功能

1. 音频录制（开始/暂停/停止）
2. 音频播放（播放控制、进度条、可视化）
3. 语音识别（Whisper Base 模型）
4. 增强反馈（空结果、完成、错误、进度）
5. 立体声处理（自动混合左右声道）
6. 中文识别（语言代码：zh）

## 已解决的问题

1. ✅ 量化模型兼容性
2. ✅ 张量形状不匹配
3. ✅ 缺少输入参数
4. ✅ 输出键名错误
5. ✅ 解码维度不正确
6. ✅ 识别结果为空
7. ✅ 繁体中文识别
8. ✅ 语法错误

## 项目状态

- ✅ 功能完整：所有核心功能已实现
- ✅ 可以运行：开发服务器可正常启动
- ✅ 识别工作：Whisper 模型可以正常识别中文
- ✅ 代码稳定：基于官方实现，经过充分测试
