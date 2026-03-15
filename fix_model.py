import onnx
from onnx import optimizer

# 加载模型
model_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/model.onnx"
model = onnx.load(model_path)

print("Model loaded, optimizing...")

# 定义优化通道
passes = [
    "extract_constant_to_initializer",
    "eliminate_unused_initializer",
    "fuse_bn_into_conv",
    "fuse_pad_into_conv",
    "eliminate_identity",
    "eliminate_nop_transpose",
    "eliminate_nop_pad",
    "eliminate_unused_identity",
    "fuse_transpose_into_gemm"
]

# 应用优化
optimized_model = optimizer.optimize(model, passes)

# 保存优化后的模型
optimized_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/model_optimized.onnx"
onnx.save(optimized_model, optimized_path)

print(f"Optimized model saved to {optimized_path}")

# 复制优化后的模型到 onnx 目录
import shutil

encoder_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx/encoder_model_fp16.onnx"
decoder_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx/decoder_model_merged_fp16.onnx"

shutil.copy2(optimized_path, encoder_path)
shutil.copy2(optimized_path, decoder_path)

print("Copied optimized model to onnx directory")
print("Model optimization completed!")