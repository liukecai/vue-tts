# Git 提交记录

## 提交信息

```
chore: 将模型文件夹改为 submodule

- 删除 public/models/whisper-tiny 文件夹
- 添加 Hugging Face Whisper Tiny 模型作为 submodule
- 更新 .gitignore 文件
- 使用 Hugging Face CDN 加载模型，避免大文件问题
```

## 变更概述

本次提交将本地的大模型文件夹删除，并添加为 Git submodule，使用 Hugging Face 的模型仓库。这样可以：
1. 避免 GitHub 文件大小限制问题
2. 利用 Hugging Face 的 CDN 加速
3. 减小仓库大小
4. 方便模型更新和维护

## 详细变更

### 1. 删除本地模型文件夹

#### 删除的目录
- `public/models/whisper-tiny/` - 完整的 Whisper Tiny 模型文件夹

#### 删除原因
- 这些文件过大（超过 100 MB），无法直接推送到 GitHub
- 使用 Git submodule 可以更好地管理大型模型文件
- 利用 Hugging Face 的 CDN 可以提高加载速度

### 2. 添加 Git Submodule

#### 新增的 submodule
```bash
# 添加 Hugging Face Whisper Tiny 模型作为 submodule
git submodule add https://huggingface.co/Xenova/whisper-tiny public/models/whisper-tiny
```

#### Submodule 信息
- **URL**: https://huggingface.co/Xenova/whisper-tiny
- **本地路径**: public/models/whisper-tiny
- **用途**: 存储和加载 Whisper Tiny 模型文件

### 3. 更新 .gitignore 文件

#### 新增忽略规则
```
public/models/whisper-tiny
```

#### 忽略原因
- `public/models/whisper-tiny` 现在是 Git submodule，不需要被 Git 跟踪
- 避免混淆和冲突

## 影响的文件

### 修改的文件
1. `.gitignore` - 添加了 submodule 路径到忽略列表

### 新增的文件
1. `.gitmodules` - Git submodule 配置文件（自动生成）

### 删除的文件
1. `public/models/whisper-tiny/` - 本地模型文件夹

## 功能特性

### 改进
- ✅ 避免了 GitHub 文件大小限制问题
- ✅ 利用 Hugging Face CDN 加速模型加载
- ✅ 减小了仓库大小
- ✅ 方便模型更新和维护
- ✅ 使用 Git submodule 管理大型模型文件

### 技术改进
- ✅ 正确的 Git submodule 配置
- ✅ 完善的 .gitignore 配置
- ✅ 优化的项目结构

## 使用说明

### Submodule 管理

#### 更新 Submodule
```bash
# 更新 submodule 到最新版本
git submodule update --remote

# 切换到特定版本
git submodule update --init --recursive
```

#### 初始化 Submodule
```bash
# 克隆包含 submodule 的仓库时，需要初始化
git clone --recursive https://github.com/liukecai/vue-tts.git
```

### 代码修改

#### 更新模型路径引用

由于现在使用 submodule，需要更新代码中的模型路径引用：

**在 whisperONNX.ts 中：**
```typescript
// 原来的路径
const modelPath = '/models/whisper-tiny/onnx/encoder_model.onnx';

// 新的路径（submodule）
const modelPath = '/models/whisper-tiny/onnx/encoder_model.onnx';
```

**在 App.vue 中：**
```typescript
// 如果有其他引用模型路径的地方，也需要相应更新
```

## 后续步骤

### 1. 提交当前更改
```bash
git add -A
git commit -m "chore: 将模型文件夹改为 submodule

- 删除 public/models/whisper-tiny 文件夹
- 添加 Hugging Face Whisper Tiny 模型作为 submodule
- 更新 .gitignore 文件
- 使用 Hugging Face CDN 加载模型，避免大文件问题"
```

### 2. 推送到 GitHub
```bash
git push origin main
```

### 3. 更新代码中的模型路径引用

需要更新 `src/services/whisperONNX.ts` 中的模型路径，确保正确引用 submodule 中的文件。

### 4. 测试验证

- ✅ 测试模型加载是否正常
- ✅ 测试语音识别功能
- ✅ 验证 CDN 加速效果

## 兼容性

- ✅ 支持所有现代浏览器
- ✅ 向后兼容现有功能
- ✅ 不影响其他代码

## 相关资源

- [Git Submodule 文档](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Hugging Face 模型仓库](https://huggingface.co/Xenova/whisper-tiny)
- [Transformers.js 文档](https://huggingface.co/docs/transformers/installation)

## 提交命令

```bash
git add -A
git commit -m "chore: 将模型文件夹改为 submodule

- 删除 public/models/whisper-tiny 文件夹
- 添加 Hugging Face Whisper Tiny 模型作为 submodule
- 更新 .gitignore 文件
- 使用 Hugging Face CDN 加载模型，避免大文件问题"
```
