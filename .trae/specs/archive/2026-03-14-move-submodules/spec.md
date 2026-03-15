# 移动 Submodule 到新文件夹 - 产品需求文档

## Overview
- **Summary**: 本项目旨在将当前项目中的所有 git submodule 移动到一个新的根目录文件夹中，以更好地组织项目结构。
- **Purpose**: 解决 submodule 分散在不同位置的问题，提高项目结构的清晰性和可维护性。
- **Target Users**: 项目维护者和开发者

## Goals
- 将所有现有 submodule 移动到新的根目录文件夹中
- 确保移动后 submodule 功能正常，不影响项目的正常运行
- 保持 git 历史记录的完整性

## Non-Goals (Out of Scope)
- 不添加新的 submodule
- 不修改 submodule 的内容
- 不更改 submodule 的远程仓库地址

## Background & Context
- 当前项目存在一个 submodule：`public/models/whisper-tiny`
- 为了更好地组织项目结构，需要将所有 submodule 集中到一个专门的文件夹中

## Functional Requirements
- **FR-1**: 在项目根目录创建一个新的文件夹，用于存放所有 submodule
- **FR-2**: 将现有的 submodule 移动到新创建的文件夹中
- **FR-3**: 更新 git 配置，确保 submodule 路径正确
- **FR-4**: 验证移动后的 submodule 功能正常

## Non-Functional Requirements
- **NFR-1**: 保持 git 历史记录的完整性
- **NFR-2**: 确保移动过程不影响项目的正常构建和运行
- **NFR-3**: 遵循 git 最佳实践，正确处理 submodule 的移动

## Constraints
- **Technical**: 使用 git 命令行工具进行操作
- **Dependencies**: 依赖于 git 版本控制系统

## Assumptions
- 项目使用 git 作为版本控制系统
- 现有 submodule 已经正确初始化和更新

## Acceptance Criteria

### AC-1: 新文件夹创建成功
- **Given**: 项目根目录
- **When**: 执行创建文件夹操作
- **Then**: 根目录下出现新的文件夹，用于存放 submodule
- **Verification**: `programmatic`

### AC-2: Submodule 移动成功
- **Given**: 新文件夹已创建
- **When**: 执行 submodule 移动操作
- **Then**: 所有 submodule 都被移动到新文件夹中
- **Verification**: `programmatic`

### AC-3: Git 配置更新成功
- **Given**: Submodule 已移动
- **When**: 执行 git 配置更新
- **Then**: `.gitmodules` 文件中的路径正确更新，git 子模块配置正确
- **Verification**: `programmatic`

### AC-4: Submodule 功能正常
- **Given**: Submodule 已移动并配置更新
- **When**: 执行项目构建或运行
- **Then**: 项目正常构建和运行，submodule 功能不受影响
- **Verification**: `programmatic`

## Open Questions
- [ ] 新文件夹的具体名称是什么？
- [ ] 是否需要保留原有的 submodule 路径结构？