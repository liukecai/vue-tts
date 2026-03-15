# 移动 Submodule 到新文件夹 - 验证检查清单

- [x] 检查根目录下是否存在名为 "submodules" 的文件夹
- [x] 检查 `submodules/whisper-tiny` 目录是否存在且包含 submodule 内容
- [x] 检查 `public/models/whisper-tiny` 目录是否不存在
- [x] 检查 `.gitmodules` 文件中的路径是否更新为 `submodules/whisper-tiny`
- [x] 检查 git 状态是否显示配置已更新，无错误
- [x] 执行项目构建命令，确保项目正常构建
- [x] 验证 submodule 内容是否可正常访问