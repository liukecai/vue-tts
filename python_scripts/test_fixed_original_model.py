import os
import onnx
import onnxruntime as ort

# 修复后的原始模型路径
model_dir = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx"
fixed_encoder_path = os.path.join(model_dir, "encoder_model_fp16_fixed.onnx")
fixed_decoder_path = os.path.join(model_dir, "decoder_model_merged_fp16_fixed.onnx")

print("测试修复后的原始模型加载...")
print(f"编码器模型路径: {fixed_encoder_path}")
print(f"解码器模型路径: {fixed_decoder_path}")

# 检查文件是否存在
if not os.path.exists(fixed_encoder_path):
    print(f"错误: 编码器模型文件不存在: {fixed_encoder_path}")
    exit(1)

if not os.path.exists(fixed_decoder_path):
    print(f"错误: 解码器模型文件不存在: {fixed_decoder_path}")
    exit(1)

# 测试编码器模型加载
print("\n测试编码器模型加载...")
try:
    # 加载模型
    encoder_session = ort.InferenceSession(fixed_encoder_path)
    print("✓ 编码器模型加载成功")
    
    # 检查模型输入输出
    print("编码器模型输入:")
    for input in encoder_session.get_inputs():
        print(f"  - {input.name}: {input.shape}, {input.type}")
    
    print("编码器模型输出:")
    for output in encoder_session.get_outputs():
        print(f"  - {output.name}: {output.shape}, {output.type}")
    
except Exception as e:
    print(f"✗ 编码器模型加载失败: {e}")

# 测试解码器模型加载
print("\n测试解码器模型加载...")
try:
    # 加载模型
    decoder_session = ort.InferenceSession(fixed_decoder_path)
    print("✓ 解码器模型加载成功")
    
    # 检查模型输入输出
    print("解码器模型输入:")
    for input in decoder_session.get_inputs():
        print(f"  - {input.name}: {input.shape}, {input.type}")
    
    print("解码器模型输出:")
    for output in decoder_session.get_outputs():
        print(f"  - {output.name}: {output.shape}, {output.type}")
    
except Exception as e:
    print(f"✗ 解码器模型加载失败: {e}")

print("\n模型加载测试完成！")