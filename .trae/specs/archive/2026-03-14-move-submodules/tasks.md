# 移动 Submodule 到新文件夹 - 实现计划

## [x] Task 1: 确定新文件夹名称并创建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 确定新文件夹的名称为 "submodules"
  - 在项目根目录创建该文件夹
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 根目录下存在名为 "submodules" 的文件夹
- **Notes**: 选择 "submodules" 作为文件夹名称，符合项目结构组织的最佳实践

## [x] Task 2: 移动现有的 submodule 到新文件夹
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 使用 git 命令将 `public/models/whisper-tiny` submodule 移动到 `submodules/whisper-tiny`
  - 确保移动过程遵循 git submodule 移动的最佳实践
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: `submodules/whisper-tiny` 目录存在且包含 submodule 内容
  - `programmatic` TR-2.2: `public/models/whisper-tiny` 目录不存在
- **Notes**: 需要使用 git mv 命令来移动 submodule，以保持 git 历史记录

## [x] Task 3: 更新 git 配置和 .gitmodules 文件
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 更新 `.gitmodules` 文件中的 submodule 路径
  - 更新 git 缓存中的 submodule 配置
  - 提交配置更改
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: `.gitmodules` 文件中的路径更新为 `submodules/whisper-tiny`
  - `programmatic` TR-3.2: git 状态显示配置已更新，无错误
- **Notes**: 需要使用 git commands 来更新配置，确保 submodule 引用正确

## [x] Task 4: 验证移动后的 submodule 功能
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 执行项目构建命令，确保项目正常构建
  - 验证 submodule 功能是否正常
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: 项目构建成功，无错误
  - `programmatic` TR-4.2: submodule 内容可正常访问
- **Notes**: 根据项目的构建命令执行验证，确保移动不会影响项目功能