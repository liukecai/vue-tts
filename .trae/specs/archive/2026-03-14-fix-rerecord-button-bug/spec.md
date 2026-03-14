# 修复重新录制按钮BUG Spec

## Why
第一次录音后，点击"重新录制"按钮时，虽然控制台显示"recording started"提示，但按钮状态不会改变，录音也没有真正开始，导致用户无法结束录制。这影响了用户体验。

## What Changes
- 修复 `AudioRecorder.vue` 组件中 `startNewRecording()` 方法的逻辑
- 确保点击"重新录制"按钮时能够正确开始新的录音会话

## Impact
- Affected specs: 录音功能
- Affected code: `src/components/AudioRecorder.vue`

## ADDED Requirements
### Requirement: 重新录制功能
系统 SHALL 在用户点击"重新录制"按钮时，正确启动新的录音会话并更新UI状态。

#### Scenario: 成功重新录制
- **WHEN** 用户完成第一次录音后点击"重新录制"按钮
- **THEN** 系统应停止当前音频播放，清理之前的录音状态，并开始新的录音
- **THEN** 按钮状态应从"重新录制"变为"暂停/停止"按钮
- **THEN** 用户应能够正常暂停和停止新的录音

## MODIFIED Requirements
无

## REMOVED Requirements
无
