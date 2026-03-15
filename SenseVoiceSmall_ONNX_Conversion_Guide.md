# SenseVoiceSmall 模型 ONNX 标准化转换指南

## 1. 项目背景
SenseVoiceSmall 是一个多语言语音理解模型，来自 ModelScope。当前模型已存在 ONNX 版本，但不符合标准 ONNX 规范，需要转换为标准格式以便在 vue-tts 项目中正确使用。

## 2. 准备工作

### 2.1 环境配置
1. 创建虚拟环境：
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. 安装必要的依赖：
   ```bash
   pip install onnx onnxruntime torch torchvision torchaudio pyyaml sentencepiece
   ```

### 2.2 模型分析
1. 验证当前模型的 ONNX 格式：
   ```bash
   python validate_model.py
   ```

2. 分析模型结构：
   ```bash
   python analyze_model.py
   ```

## 3. 模型转换步骤

### 3.1 创建标准目录结构
1. 创建 onnx 文件夹：
   ```bash
   mkdir -p /home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx
   ```

### 3.2 转换模型文件
1. 复制模型到 onnx 目录并按照标准格式命名：
   ```bash
   python convert_model.py
   ```

### 3.3 处理配置文件
1. 转换配置文件：
   ```bash
   python convert_config.py
   ```

2. 创建词汇表和分词器文件：
   ```bash
   python create_vocab.py
   ```

## 4. 验证转换结果

### 4.1 验证模型结构
1. 检查所有必要的文件是否存在：
   - config.json
   - preprocessor_config.json
   - tokenizer.json
   - tokenizer_config.json
   - special_tokens_map.json
   - vocab.json
   - onnx/encoder_model_fp16.onnx
   - onnx/decoder_model_merged_fp16.onnx

### 4.2 验证模型加载
1. 运行验证脚本：
   ```bash
   python verify_converted_model.py
   ```

## 5. 遇到的问题及解决方案

### 5.1 类型不匹配错误
**问题**：模型在 ONNX Runtime 中加载时出现类型不匹配错误：
```
Type Error: Type parameter (T) of Optype (Add) bound to different types (tensor(int64) and tensor(int32) in node (node_add_39).
```

**解决方案**：
1. 尝试使用 ONNX 形状推断来修复模型：
   ```bash
   python fix_model_v2.py
   ```

2. 如果问题仍然存在，可能需要从原始 PyTorch 模型重新导出 ONNX 格式：
   - 从 ModelScope 下载原始 PyTorch 模型
   - 使用 PyTorch 的 `torch.onnx.export` 函数重新导出

### 5.2 依赖安装问题
**问题**：系统不允许直接安装包。

**解决方案**：创建虚拟环境并在虚拟环境中安装依赖。

## 6. 集成到 vue-tts 项目

1. 确保模型文件和配置文件已正确放置在 `public/models/SenseVoiceSmall-onnx` 目录中。

2. 更新 vue-tts 项目中的模型路径配置，指向转换后的模型。

3. 测试项目是否能够正常加载和使用模型。

## 7. 模型结构说明

### 标准 ONNX 模型结构
```
SenseVoiceSmall-onnx/
├── config.json                 # 架构配置
├── preprocessor_config.json    # 音频预处理配置
├── tokenizer.json              # 分词器配置
├── tokenizer_config.json       # 分词器配置
├── special_tokens_map.json     # 特殊 token 映射
├── vocab.json                  # 词表
├── tokens.json                 # 原始词库文件
├── chn_jpn_yue_eng_ko_spectok.bpe.model  # BPE 模型
└── onnx/                       # ONNX 权重文件夹
    ├── encoder_model_fp16.onnx         # 编码器模型
    └── decoder_model_merged_fp16.onnx  # 解码器模型
```

## 8. 总结

本指南提供了将 SenseVoiceSmall 模型转换为标准 ONNX 格式的详细步骤，包括环境配置、模型转换、配置文件处理和验证过程。虽然在验证过程中遇到了类型不匹配的问题，但模型结构和配置文件已按照标准格式组织完成。

对于类型不匹配问题，建议从原始 PyTorch 模型重新导出 ONNX 格式，以确保模型在 ONNX Runtime 中能够正常加载和运行。

## 9. 参考资料
- [ONNX 官方文档](https://onnx.ai/docs/)
- [PyTorch ONNX 导出文档](https://pytorch.org/docs/stable/onnx.html)
- [ModelScope SenseVoiceSmall 模型](https://modelscope.cn/models/iic/SenseVoiceSmall)