# 增强模型初始化进度显示 Spec

## Why
当前应用虽然已经有基本的模型加载进度显示，但信息不够详细，用户无法了解模型初始化的具体阶段和当前加载的文件信息。增强进度显示可以提供更好的用户体验，让用户清楚地知道模型加载的详细状态。

## What Changes
- 在模型初始化进度区域增加更详细的信息显示
- 显示当前正在加载的文件名
- 显示模型初始化的各个阶段（下载、解析、初始化等）
- 增强进度条的视觉效果和动画
- 添加加载速度和预计剩余时间的显示
- 优化状态指示器的视觉反馈

## Impact
- Affected specs: 无
- Affected code: src/App.vue, src/types/index.ts, src/services/whisperONNX.ts

## ADDED Requirements
### Requirement: 详细的模型初始化进度显示
系统 SHALL 在模型初始化过程中提供详细的进度信息，包括当前阶段、文件名、进度百分比、加载速度和预计剩余时间。

#### Scenario: 模型下载阶段
- **WHEN** 模型正在下载时
- **THEN** 显示下载进度百分比、当前下载的文件名、下载速度和预计剩余时间

#### Scenario: 模型加载阶段
- **WHEN** 模型正在加载到内存时
- **THEN** 显示加载进度百分比、当前加载的组件名称和加载状态

#### Scenario: 模型就绪
- **WHEN** 模型加载完成
- **THEN** 显示模型已就绪的明确指示，并隐藏进度条

## MODIFIED Requirements
### Requirement: ModelLoadProgress 接口扩展
扩展 ModelLoadProgress 接口以包含更详细的进度信息。

### Requirement: 进度回调增强
增强模型加载服务的进度回调，提供更详细的阶段和文件信息。

## REMOVED Requirements
无
