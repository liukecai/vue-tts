# 切换实时语音识别模型到 Whisper Base - 验证检查清单

- [x] 检查 `public/models/whisper-base` 目录是否存在
- [x] 检查 `public/models/whisper-base` 目录中是否包含必要的模型文件
- [x] 检查 `src/services/whisperWorker.ts` 中的模型路径是否更新为 `/models/whisper-base`
- [x] 检查 `public/whisper-worker.js` 中的模型路径是否更新为 `/models/whisper-base`
- [x] 执行项目构建命令，确保构建成功
- [x] 验证实时语音识别功能是否正常工作
- [x] 测试不同场景下的语音识别效果