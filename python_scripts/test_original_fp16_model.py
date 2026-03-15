import os
import onnx
import onnxruntime as ort

# 原始 FP16 模型路径
model_dir = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx"
encoder_fp16 = os.path.join(model_dir, "encoder_model_fp16.onnx")
decoder_fp16 = os.path.join(model_dir, "decoder_model_merged_fp16.onnx")

print("测试原始 FP16 模型加载...")
print(f"编码器模型: {encoder_fp16}")
print(f"解码器模型: {decoder_fp16}")

# 检查文件是否存在
if not os.path.exists(encoder_fp16):
    print(f"错误: 编码器模型不存在: {encoder_fp16}")
    exit(1)

if not os.path.exists(decoder_fp16):
    print(f"错误: 解码器模型不存在: {decoder_fp16}")
    exit(1)

# 测试编码器模型
print("\n测试编码器模型...")
try:
    session = ort.InferenceSession(encoder_fp16)
    print("✓ 编码器模型加载成功")
    print(f"输入: {[input.name for input in session.get_inputs()]}")
    print(f"输出: {[output.name for output in session.get_outputs()]}")
except Exception as e:
    print(f"✗ 编码器模型加载失败: {e}")

# 测试解码器模型
print("\n测试解码器模型...")
try:
    session = ort.InferenceSession(decoder_fp16)
    print("✓ 解码器模型加载成功")
    print(f"输入: {[input.name for input in session.get_inputs()]}")
    print(f"输出: {[output.name for output in session.get_outputs()]}")
except Exception as e:
    print(f"✗ 解码器模型加载失败: {e}")

print("\n测试完成！")