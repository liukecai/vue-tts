import os
import onnx
import onnxruntime as ort

# 修复后的模型路径
model_dir = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx"
fixed_encoder = os.path.join(model_dir, "encoder_model_q4_fixed_final.onnx")
fixed_decoder = os.path.join(model_dir, "decoder_model_merged_q4_fixed_final.onnx")

print("测试修复后的量化模型加载...")
print(f"编码器模型: {fixed_encoder}")
print(f"解码器模型: {fixed_decoder}")

# 检查文件是否存在
if not os.path.exists(fixed_encoder):
    print(f"错误: 编码器模型不存在: {fixed_encoder}")
    exit(1)

if not os.path.exists(fixed_decoder):
    print(f"错误: 解码器模型不存在: {fixed_decoder}")
    exit(1)

# 测试编码器模型
print("\n测试编码器模型...")
try:
    session = ort.InferenceSession(fixed_encoder)
    print("✓ 编码器模型加载成功")
    print(f"输入: {[input.name for input in session.get_inputs()]}")
    print(f"输出: {[output.name for output in session.get_outputs()]}")
except Exception as e:
    print(f"✗ 编码器模型加载失败: {e}")

# 测试解码器模型
print("\n测试解码器模型...")
try:
    session = ort.InferenceSession(fixed_decoder)
    print("✓ 解码器模型加载成功")
    print(f"输入: {[input.name for input in session.get_inputs()]}")
    print(f"输出: {[output.name for output in session.get_outputs()]}")
except Exception as e:
    print(f"✗ 解码器模型加载失败: {e}")

print("\n测试完成！")