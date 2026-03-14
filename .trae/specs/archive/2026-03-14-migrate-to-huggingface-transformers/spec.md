# 迁移到 @huggingface/transformers 规范

## Why
当前项目使用 `@xenova/transformers` 包和 `Xenova/whisper-base` 模型实现语音识别。为了使用官方的 `@huggingface/transformers` 包和更轻量级的 `Xenova/whisper-tiny` 模型，需要迁移技术实现方案，以获得更好的性能和更小的模型体积。

## What Changes
- 将依赖从 `@xenova/transformers` 更新为 `@huggingface/transformers`
- 将模型从 `Xenova/whisper-base` 更改为 `Xenova/whisper-tiny`
- 更新 `WhisperTransformersService` 类的导入语句和模型加载逻辑
- 保持现有的 API 接口不变，确保向后兼容
- 移除不再需要的本地模型文件（如果使用在线模型加载）

## Impact
- Affected specs: 语音识别服务接口
- Affected code: 
  - `src/services/whisperONNX.ts` - 主要实现文件
  - `package.json` - 依赖更新

## ADDED Requirements
### Requirement: 使用 @huggingface/transformers 包
系统 SHALL 使用 `@huggingface/transformers` 包替代 `@xenova/transformers` 包来实现语音识别功能。

#### Scenario: 成功加载模型
- **WHEN** 系统初始化语音识别服务
- **THEN** 应该使用 `@huggingface/transformers` 的 `pipeline` 函数加载 `Xenova/whisper-tiny` 模型
- **AND** 模型加载进度回调应该正常工作

### Requirement: 使用 whisper-tiny 模型
系统 SHALL 使用 `Xenova/whisper-tiny` 模型进行语音识别。

#### Scenario: 执行语音识别
- **WHEN** 用户提供音频数据
- **THEN** 系统应该使用 `Xenova/whisper-tiny` 模型进行转录
- **AND** 返回识别结果文本和时间戳

## MODIFIED Requirements
### Requirement: WhisperTransformersService 类
`WhisperTransformersService` 类 SHALL 更新其实现以使用 `@huggingface/transformers` 包。

#### Scenario: 模型加载
- **WHEN** 调用 `loadModel()` 方法
- **THEN** 应该从 `@huggingface/transformers` 导入 `pipeline` 和 `env`
- **AND** 使用 `Xenova/whisper-tiny` 作为模型名称

#### Scenario: 语音转录
- **WHEN** 调用 `transcribe()` 方法
- **THEN** 应该使用加载的 `pipeline` 进行音频转录
- **AND** 返回符合 `RecognitionResult` 接口的结果

## REMOVED Requirements
### Requirement: 本地模型文件
**Reason**: 使用 `@huggingface/transformers` 后，模型可以自动从 Hugging Face 下载并缓存，无需本地模型文件
**Migration**: 移除 `public/models/Xenova/whisper-base` 目录下的模型文件（如果不再需要）
