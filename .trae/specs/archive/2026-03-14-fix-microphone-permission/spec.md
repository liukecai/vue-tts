# 修复麦克风权限问题 Spec

## Why
线上部署为 HTTPS 环境，但浏览器没有弹出麦克风权限请求，即使用户手动设置允许麦克风，点击录制时仍报错提示没有权限。这导致语音识别功能无法正常使用。

## What Changes
- 实现麦克风权限状态检查功能
- 改进权限请求的触发时机和方式
- 添加权限请求前的预检查和提示
- 改进权限请求的错误处理和用户提示
- 添加浏览器兼容性检查
- 提供更友好的错误信息和解决建议

## Impact
- Affected specs: 麦克风录音功能
- Affected code:
  - `src/services/audioRecorder.ts` - 核心录音服务
  - `src/components/AudioRecorder.vue` - 录音组件

## ADDED Requirements

### Requirement: 麦克风权限状态检查
系统 SHALL 在用户点击录音按钮前检查麦克风权限状态，并提供相应的提示。

#### Scenario: 权限未授予
- **WHEN** 麦克风权限状态为 'prompt' 或 'denied'
- **THEN** 在录音按钮旁显示权限状态提示，引导用户授权

#### Scenario: 权限已授予
- **WHEN** 麦克风权限状态为 'granted'
- **THEN** 正常显示录音按钮，用户可以开始录音

### Requirement: 改进的权限请求流程
系统 SHALL 在用户交互时主动请求麦克风权限，确保权限请求弹窗能够正常显示。

#### Scenario: 用户点击录音按钮
- **WHEN** 用户点击"开始录音"按钮
- **THEN** 立即触发麦克风权限请求，显示浏览器权限弹窗

#### Scenario: 权限请求失败
- **WHEN** 权限请求失败或被拒绝
- **THEN** 显示详细的错误信息，说明可能的原因和解决方法

### Requirement: 浏览器兼容性检查
系统 SHALL 检查浏览器是否支持必要的 API，并提供相应的提示。

#### Scenario: 浏览器不支持
- **WHEN** 浏览器不支持 `navigator.mediaDevices.getUserMedia` API
- **THEN** 显示错误提示，建议用户使用支持的浏览器

### Requirement: 改进的错误处理
系统 SHALL 提供详细的错误信息和解决建议，帮助用户解决权限问题。

#### Scenario: 权限被拒绝
- **WHEN** 用户拒绝麦克风权限或权限被浏览器阻止
- **THEN** 显示友好的错误提示，说明问题原因和解决方法

#### Scenario: 设备不支持
- **WHEN** 设备不支持麦克风或浏览器不支持相关 API
- **THEN** 显示相应的错误提示

## MODIFIED Requirements

### Requirement: 录音功能启动
修改录音启动流程，在请求麦克风权限前进行预检查，并提供更好的用户体验。

## REMOVED Requirements
无
