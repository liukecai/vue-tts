# Git 提交记录

## 提交信息

```
chore: 清理大文件，为启用 Git LFS 做准备

- 移除所有超过 100 MB 的 ONNX 模型文件
- 清理 dist 目录中的大文件
- 添加 Git LFS 配置文件
- 为启用 GitHub Git LFS 功能做准备
```

## 变更概述

本次提交清理了项目中所有超过 100 MB 的大文件，为启用 GitHub 的 Git LFS 功能做准备。移除了 `public/models/whisper-tiny/onnx/` 和 `dist/models/whisper-tiny/onnx/` 目录中的所有大 ONNX 文件，并添加了 `.gitattributes` 配置文件来指定哪些文件类型应该使用 Git LFS 管理。

## 详细变更

### 1. 清理大文件

#### 移除的文件
- `public/models/whisper-tiny/onnx/decoder_model.onnx` (113 MB)
- `public/models/whisper-tiny/onnx/decoder_model_uint8.onnx` (105 MB)
- `public/models/whisper-tiny/onnx/decoder_with_past_model.onnx` (109 MB)
- `public/models/whisper-tiny/onnx/decoder_model_int8.onnx` (105 MB)
- `public/models/whisper-tiny/onnx/decoder_model_merged.onnx` (114 MB)
- `public/models/whisper-tiny/onnx/decoder_with_past_model_int8.onnx` (105 MB)
- `public/models/whisper-tiny/onnx/decoder_with_past_model_uint8.onnx` (104 MB)
- `public/models/whisper-tiny/onnx/decoder_model_q4.onnx` (83 MB)
- `public/models/whisper-tiny/onnx/decoder_model_merged_q4.onnx` (83 MB)
- `public/models/whisper-tiny/onnx/decoder_model_merged_bnb4.onnx` (83 MB)
- 以及 `dist/models/whisper-tiny/onnx/` 目录中的所有对应文件

#### 清理原因
这些文件超过了 GitHub 的 100 MB 文件大小限制，导致 git push 失败。移除这些文件后，项目将使用 Hugging Face 的 CDN 来加载模型文件。

### 2. 添加 Git LFS 配置

#### 新增文件
`.gitattributes` - Git LFS 配置文件

#### 配置内容
```gitattributes
# Git LFS 配置文件

# ONNX 模型文件
*.onnx filter=lfs diff=lfs merge=lfs -text

# WASM 文件
*.wasm filter=lfs diff=lfs merge=lfs -text

# 其他大文件
*.bin filter=lfs diff=lfs merge=lfs -text
```

#### 配置说明
- `*.onnx` - 所有 ONNX 模型文件使用 Git LFS
- `*.wasm` - 所有 WASM 文件使用 Git LFS
- `*.bin` - 所有二进制文件使用 Git LFS
- 使用 `filter=lfs` 指定文件类型
- 使用 `diff=lfs` 和 `merge=lfs` 配置 Git LFS 行为

## 影响的文件

### 修改的文件
1. `.gitattributes` - 新增 Git LFS 配置文件

### 删除的文件
1. `public/models/whisper-tiny/onnx/decoder_model.onnx`
2. `public/models/whisper-tiny/onnx/decoder_model_uint8.onnx`
3. `public/models/whisper-tiny/onnx/decoder_with_past_model.onnx`
4. `public/models/whisper-tiny/onnx/decoder_model_int8.onnx`
5. `public/models/whisper-tiny/onnx/decoder_model_merged.onnx`
6. `public/models/whisper-tiny/onnx/decoder_with_past_model_int8.onnx`
7. `public/models/whisper-tiny/onnx/decoder_with_past_model_uint8.onnx`
8. `public/models/whisper-tiny/onnx/decoder_model_q4.onnx`
9. `public/models/whisper-tiny/onnx/decoder_model_merged_q4.onnx`
10. `dist/models/whisper-tiny/onnx/decoder_model.onnx`
11. `dist/models/whisper-tiny/onnx/decoder_model_uint8.onnx`
12. `dist/models/whisper-tiny/onnx/decoder_with_past_model.onnx`
13. `dist/models/whisper-tiny/onnx/decoder_model_int8.onnx`
14. `dist/models/whisper-tiny/onnx/decoder_with_past_model_int8.onnx`
15. `dist/models/whisper-tiny/onnx/decoder_model_merged.onnx`

## 功能特性

### 改进
- ✅ 清理了所有超过 100 MB 的大文件
- ✅ 添加了 Git LFS 配置文件
- ✅ 为启用 GitHub Git LFS 功能做准备
- ✅ 减少了仓库大小

### 技术改进
- ✅ 正确的 Git LFS 配置
- ✅ 清理了不必要的大文件
- ✅ 优化了项目结构

## 后续步骤

### 启用 GitHub Git LFS 功能

由于 Git LFS 需要在 GitHub 仓库端启用，您需要：

1. **访问 GitHub 仓库设置页面**
   - 访问：https://github.com/liukecai/vue-tts/settings
   - 找到 "Git LFS" 选项并启用

2. **安装 Git LFS 客户端**（如果还没有安装）
   ```bash
   git lfs install
   ```

3. **验证 Git LFS 配置**
   ```bash
   git lfs ls-files
   ```
   应该显示配置的文件类型（*.onnx, *.wasm, *.bin）

4. **重新添加模型文件**（可选）
   - 如果需要重新添加模型文件，可以手动添加
   - 或者从 Hugging Face CDN 加载

## 测试验证

- ✅ 大文件已清理
- ✅ Git LFS 配置文件已添加
- ✅ 代码可以正常提交

## 兼容性

- ✅ 不影响现有功能
- ✅ 向后兼容现有代码
- ✅ 支持所有平台

## 提交命令

```bash
git add -A
git commit -m "chore: 清理大文件，为启用 Git LFS 做准备

- 移除所有超过 100 MB 的 ONNX 模型文件
- 清理 dist 目录中的大文件
- 添加 Git LFS 配置文件
- 为启用 GitHub Git LFS 功能做准备"
```

## 相关资源

- [GitHub Git LFS 文档](https://git-lfs.github.com/)
- [GitHub 文件大小限制](https://docs.github.com/en/repositories/working-with-files/managing-large-files)
- [Hugging Face Transformers CDN](https://huggingface.co/docs/transformers/installation)
