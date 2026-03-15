# Tasks
- [x] Task 1: 更新 package.json 依赖
  - [x] 将 `@xenova/transformers` 替换为 `@huggingface/transformers`
  - [x] 运行 `npm install` 安装新依赖

- [x] Task 2: 更新 WhisperTransformersService 导入语句
  - [x] 修改 `src/services/whisperONNX.ts` 中的导入语句
  - [x] 从 `@huggingface/transformers` 导入 `pipeline` 和 `env`

- [x] Task 3: 更新模型加载逻辑
  - [x] 修改 `loadModel()` 方法中的模型名称为 `Xenova/whisper-tiny`
  - [x] 验证进度回调功能正常工作

- [x] Task 4: 验证语音转录功能
  - [x] 确保 `transcribe()` 方法正常工作
  - [x] 验证返回结果符合 `RecognitionResult` 接口

- [x] Task 5: 清理不需要的本地模型文件
  - [x] 检查并移除不再需要的本地模型文件（如果使用在线加载）

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 4]
