# Tasks

- [ ] Task 1: 移除 @xenova/transformers 依赖
  - [ ] 从 package.json 中移除 @xenova/transformers
  - [ ] 安装 onnxruntime-web 依赖（如果未安装）

- [ ] Task 2: 创建 ONNX 模型加载服务
  - [ ] 创建 ONNXRuntime 实例
  - [ ] 实现模型文件加载逻辑
  - [ ] 创建 encoder 和 decoder 推理会话
  - [ ] 实现模型初始化和验证

- [ ] Task 3: 实现音频预处理服务
  - [ ] 创建音频重采样功能（到 16kHz）
  - [ ] 创建单声道转换功能
  - [ ] 实现 Mel 频谱图计算
  - [ ] 实现音频分片处理

- [ ] Task 4: 实现模型推理服务
  - [ ] 创建推理服务类
  - [ ] 实现 encoder 推理
  - [ ] 实现 decoder 推理
  - [ ] 实现结果解码和后处理

- [ ] Task 5: 重构 WhisperService
  - [ ] 修改 WhisperService 使用新的 ONNX 实现
  - [ ] 保持相同的 API 接口
  - [ ] 更新 App.vue 中的调用方式

- [ ] Task 6: 测试本地模型加载
  - [ ] 测试模型文件加载
  - [ ] 测试推理功能
  - [ ] 验证识别结果

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 2, Task 3]
- [Task 5] depends on [Task 2, Task 3, Task 4]
- [Task 6] depends on [Task 5]
