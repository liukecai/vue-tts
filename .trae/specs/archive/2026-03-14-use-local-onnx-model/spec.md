# 使用本地 ONNX 模型文件 Spec

## Why
当前实现使用 @xenova/transformers 库的 Xenova/whisper-tiny 模型，会从网络自动下载模型文件，而不是使用用户本地的 ONNX 模型文件（~/whisper-tiny-ONNX）。需要修改实现以使用本地 ONNX 模型文件，避免重复下载和提高加载速度。

## What Changes
- 修改 WhisperService 使用本地 ONNX 模型文件
- 移除 @xenova/transformers 依赖
- 使用 onnxruntime-web 直接加载和运行 ONNX 模型
- 实现音频预处理（重采样、Mel 频谱图计算）
- 实现模型推理逻辑
- 实现结果解码逻辑

## Impact
- Affected specs: 无（修复现有功能）
- Affected code: WhisperService, package.json, App.vue

## ADDED Requirements
无

## MODIFIED Requirements

### Requirement: Whisper 模型加载
系统 SHALL 使用本地的 ONNX 模型文件进行语音识别，而不是从网络下载。

#### Scenario: 加载本地 ONNX 模型
- **WHEN** 应用启动
- **THEN** 从 /models/ 路径加载本地的 encoder_model_q4f16.onnx 和 decoder_model_merged_q4f16.onnx
- **THEN** 使用 onnxruntime-web 创建推理会话
- **THEN** 模型准备就绪可以进行推理

### Requirement: 音频预处理
系统 SHALL 对录制的音频进行预处理，包括重采样到 16kHz 和计算 Mel 频谱图。

#### Scenario: 音频预处理
- **WHEN** 用户停止录音
- **THEN** 音频被重采样到 16kHz
- **THEN** 计算音频的 Mel 频谱图特征
- **THEN** 预处理后的数据准备好用于模型推理

### Requirement: 模型推理
系统 SHALL 使用加载的 ONNX 模型对预处理后的音频进行推理。

#### Scenario: 模型推理
- **WHEN** 音频预处理完成
- **THEN** 使用 encoder 模型编码音频特征
- **THEN** 使用 decoder 模型解码生成文本
- **THEN** 返回识别结果

## REMOVED Requirements

### Requirement: 网络模型下载
**Reason**: 用户希望使用本地 ONNX 模型文件，避免网络下载和重复存储
**Migration**: 移除 @xenova/transformers 依赖，改用 onnxruntime-web 和本地模型文件
