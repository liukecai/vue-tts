# SenseVoiceSmall 模型 ONNX 标准化 - 产品需求文档

## Overview
- **Summary**: 将 SenseVoiceSmall 模型转换为标准 ONNX 格式，确保其符合 ONNX 标准规范，以便在 vue-tts 项目中正确使用。
- **Purpose**: 解决 SenseVoiceSmall 模型暂时不支持 ONNX 标准的问题，使其能够在标准 ONNX 运行时环境中正常工作。
- **Target Users**: 开发人员和部署人员，需要在 vue-tts 项目中使用 SenseVoiceSmall 模型进行语音识别。

## Goals
- 将 SenseVoiceSmall 模型转换为标准 ONNX 格式
- 确保转换后的模型在标准 ONNX 运行时中可正常工作
- 保持模型的功能和性能不变
- 确保 token 词库正确处理
- 提供详细的转换步骤和验证方法

## Non-Goals (Out of Scope)
- 模型量化或优化
- 模型架构修改
- 性能调优
- 其他模型的转换

## Background & Context
- SenseVoiceSmall 是一个多语言语音理解模型，来自 ModelScope
- 当前模型已存在 ONNX 版本，但不符合标准 ONNX 规范
- vue-tts 项目需要使用标准 ONNX 格式的模型进行语音识别
- ONNX (Open Neural Network Exchange) 是一种开放格式，用于表示机器学习模型
- 标准 ONNX 模型结构参考（基于项目中的 whisper-base 模型）：
  ```
  model/
  ├── config.json                 # 架构配置
  ├── preprocessor_config.json    # 音频预处理 (ASR 特有)
  ├── tokenizer.json              # 分词器 (必带)
  ├── tokenizer_config.json       # 分词配置 (必带)
  ├── special_tokens_map.json     # 特殊 token 映射
  ├── vocab.json                  # 词表
  └── onnx/                       # ONNX 权重文件夹
      ├── encoder_model_fp16.onnx         # 编码器模型
      ├── decoder_model_merged_fp16.onnx  # 解码器模型
      └── encoder_model_quantized.onnx    # 量化模型（可选）
  ```
- 当前 SenseVoiceSmall-onnx 模型结构：
  ```
  SenseVoiceSmall-onnx/
  ├── config.yaml              # 配置文件（YAML 格式）
  ├── configuration.json       # 简单配置
  ├── model.onnx               # 单一模型文件
  ├── chn_jpn_yue_eng_ko_spectok.bpe.model  # BPE 模型
  └── tokens.json              # 词库文件
  ```

## Functional Requirements
- **FR-1**: 分析当前 SenseVoiceSmall 模型的 ONNX 格式问题
- **FR-2**: 提供模型转换方案，将其转换为标准 ONNX 格式，包括正确的模型结构
- **FR-3**: 验证转换后的模型功能正常
- **FR-4**: 确保 token 词库正确处理，包括必要的配置文件
- **FR-5**: 提供转换步骤的详细文档

## Non-Functional Requirements
- **NFR-1**: 转换过程应保持模型的原始性能
- **NFR-2**: 转换后的模型应符合 ONNX 1.12 或更高版本的标准
- **NFR-3**: 转换过程应可复现，提供完整的步骤说明

## Constraints
- **Technical**: 需要安装 ONNX 相关工具和依赖
- **Dependencies**: 依赖 ONNX, ONNX Runtime, PyTorch 等工具

## Assumptions
- 原始模型的 PyTorch 版本可用或可获取
- 开发环境支持必要的工具安装
- 转换过程不会影响模型的核心功能

## Acceptance Criteria

### AC-1: 模型分析完成
- **Given**: 访问到当前 SenseVoiceSmall 模型文件
- **When**: 分析模型的 ONNX 格式问题
- **Then**: 能够识别出不符合标准 ONNX 格式的问题
- **Verification**: `human-judgment`

### AC-2: 模型转换成功
- **Given**: 完成模型分析
- **When**: 执行转换步骤
- **Then**: 生成符合标准 ONNX 格式的模型文件
- **Verification**: `programmatic`

### AC-3: 模型功能验证
- **Given**: 转换后的标准 ONNX 模型
- **When**: 在标准 ONNX Runtime 中运行模型
- **Then**: 模型能够正常进行语音识别
- **Verification**: `programmatic`

### AC-4: 转换文档完成
- **Given**: 转换过程完成
- **When**: 编写转换步骤文档
- **Then**: 提供详细的转换步骤和验证方法
- **Verification**: `human-judgment`

## Open Questions
- [ ] 当前模型的具体 ONNX 格式问题是什么？
- [ ] 是否需要从原始 PyTorch 模型重新导出，还是可以直接修复现有 ONNX 模型？
- [ ] 转换过程中需要注意哪些特定于 SenseVoiceSmall 模型的问题？