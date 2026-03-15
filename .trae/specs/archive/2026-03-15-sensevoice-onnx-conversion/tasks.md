# SenseVoiceSmall 模型 ONNX 标准化 - 实现计划

## [ ] 任务 1: 分析当前 SenseVoiceSmall 模型的 ONNX 格式
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 检查当前 model.onnx 文件的结构和格式
  - 使用 ONNX 工具验证模型是否符合标准
  - 识别可能存在的格式问题
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 使用 onnx.checker 验证模型格式
  - `human-judgment` TR-1.2: 分析模型结构，识别非标准部分
- **Notes**: 需要安装 ONNX 库来执行验证

## [ ] 任务 2: 安装必要的依赖工具
- **Priority**: P0
- **Depends On**: 任务 1
- **Description**:
  - 安装 ONNX, ONNX Runtime, PyTorch 等必要工具
  - 确保环境配置正确
- **Acceptance Criteria Addressed**: 无直接对应 AC，为后续任务做准备
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证所有依赖工具安装成功
  - `programmatic` TR-2.2: 验证工具版本兼容性
- **Notes**: 依赖版本可能需要与模型兼容

## [ ] 任务 3: 准备原始 PyTorch 模型（如果需要）
- **Priority**: P1
- **Depends On**: 任务 1
- **Description**:
  - 如果现有 ONNX 模型无法直接修复，需要获取原始 PyTorch 模型
  - 从 ModelScope 或其他来源下载原始模型
- **Acceptance Criteria Addressed**: 无直接对应 AC，为后续任务做准备
- **Test Requirements**:
  - `programmatic` TR-3.1: 验证 PyTorch 模型可加载
  - `human-judgment` TR-3.2: 确认模型版本与当前 ONNX 模型匹配
- **Notes**: 可能需要从 ModelScope 下载原始模型

## [ ] 任务 4: 执行模型转换
- **Priority**: P0
- **Depends On**: 任务 2, 任务 3（如果需要）
- **Description**:
  - 根据分析结果，选择合适的转换方法
  - 执行转换操作，生成标准 ONNX 格式模型
  - 按照标准结构组织模型文件：
    - 创建 onnx 文件夹，包含 encoder_model.onnx 和 decoder_model_merged.onnx
    - 确保模型结构符合 ONNX 标准规范
  - 保存转换后的模型文件
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-4.1: 验证转换过程成功完成
  - `programmatic` TR-4.2: 验证生成的模型文件存在且大小合理
  - `human-judgment` TR-4.3: 验证模型结构符合标准 ONNX 格式要求
- **Notes**: 转换方法可能包括：1) 直接修复现有 ONNX 模型；2) 从 PyTorch 模型重新导出

## [ ] 任务 5: 处理 token 词库和配置文件
- **Priority**: P0
- **Depends On**: 任务 4
- **Description**:
  - 确保 token 词库文件正确配置，参考 whisper-base 模型结构，包括：
    - tokenizer.json（分词器，必带）
    - tokenizer_config.json（分词配置，必带）
    - special_tokens_map.json（特殊 token 映射）
    - vocab.json（词表）
    - 其他必要的词库文件（如 chn_jpn_yue_eng_ko_spectok.bpe.model 和 tokens.json）
  - 确保模型配置文件正确：
    - config.json（架构配置，从 config.yaml 转换）
    - preprocessor_config.json（音频预处理，ASR 特有）
  - 验证词库文件与转换后的模型兼容
  - 确保词库文件在 vue-tts 项目中正确引用
- **Acceptance Criteria Addressed**: 无直接对应 AC，为 FR-4 做准备
- **Test Requirements**:
  - `human-judgment` TR-5.1: 验证所有必要的配置文件存在且格式正确（参考 whisper-base 结构）
  - `programmatic` TR-5.2: 验证模型能够使用词库文件进行正确的 token 处理
  - `human-judgment` TR-5.3: 验证模型结构符合标准 ONNX 格式要求
- **Notes**: 需要确保所有配置文件路径正确，特别是将 config.yaml 转换为 config.json

## [ ] 任务 6: 验证转换后的模型
- **Priority**: P0
- **Depends On**: 任务 5
- **Description**:
  - 使用 ONNX Runtime 加载并运行转换后的模型
  - 测试模型的基本功能
  - 验证模型输出是否符合预期
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-6.1: 验证模型可在 ONNX Runtime 中加载
  - `programmatic` TR-6.2: 验证模型能够处理示例输入并产生输出
  - `human-judgment` TR-6.3: 验证输出结果的合理性
- **Notes**: 需要准备测试音频样本

## [ ] 任务 7: 编写转换步骤文档
- **Priority**: P1
- **Depends On**: 任务 6
- **Description**:
  - 详细记录转换过程的每一步
  - 包括环境配置、工具安装、转换命令等
  - 提供验证方法和故障排除建议
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-7.1: 文档内容完整，步骤清晰
  - `human-judgment` TR-7.2: 文档可作为指南复现转换过程
- **Notes**: 文档应包括命令示例和可能的错误处理

## [ ] 任务 8: 集成到 vue-tts 项目
- **Priority**: P1
- **Depends On**: 任务 6
- **Description**:
  - 将转换后的标准 ONNX 模型复制到 vue-tts 项目的适当位置
  - 更新项目配置以使用新模型
  - 测试项目中的模型加载和使用
- **Acceptance Criteria Addressed**: 无直接对应 AC，确保项目集成成功
- **Test Requirements**:
  - `programmatic` TR-8.1: 验证模型在 vue-tts 项目中可加载
  - `programmatic` TR-8.2: 验证项目能够正常使用模型进行语音识别
- **Notes**: 需要确保模型路径和配置正确