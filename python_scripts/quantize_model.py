import os
import onnx
from onnxruntime.quantization import quantize_dynamic, QuantType

# 模型路径
model_dir = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx"
encoder_path = os.path.join(model_dir, "encoder_model_fp16.onnx")
decoder_path = os.path.join(model_dir, "decoder_model_merged_fp16.onnx")

# 输出路径
quantized_dir = os.path.join(model_dir, "quantized")
os.makedirs(quantized_dir, exist_ok=True)

quantized_encoder_path = os.path.join(quantized_dir, "encoder_model_q4.onnx")
quantized_decoder_path = os.path.join(quantized_dir, "decoder_model_merged_q4.onnx")

print("开始量化模型...")
print(f"编码器模型: {encoder_path}")
print(f"解码器模型: {decoder_path}")

# 量化编码器模型
print("\n量化编码器模型...")
try:
    quantize_dynamic(
        encoder_path,
        quantized_encoder_path,
        weight_type=QuantType.QUInt8,  # 使用Q8精度，这是ONNX Runtime支持的最低精度
        per_channel=True,
        reduce_range=True
    )
    print(f"编码器模型量化完成: {quantized_encoder_path}")
except Exception as e:
    print(f"编码器模型量化失败: {e}")

# 量化解码器模型
print("\n量化解码器模型...")
try:
    quantize_dynamic(
        decoder_path,
        quantized_decoder_path,
        weight_type=QuantType.QUInt8,
        per_channel=True,
        reduce_range=True
    )
    print(f"解码器模型量化完成: {quantized_decoder_path}")
except Exception as e:
    print(f"解码器模型量化失败: {e}")

# 检查量化后的模型大小
print("\n量化前后模型大小对比:")

if os.path.exists(encoder_path):
    original_encoder_size = os.path.getsize(encoder_path) / (1024 * 1024)
    print(f"原始编码器模型大小: {original_encoder_size:.2f} MB")

if os.path.exists(decoder_path):
    original_decoder_size = os.path.getsize(decoder_path) / (1024 * 1024)
    print(f"原始解码器模型大小: {original_decoder_size:.2f} MB")

if os.path.exists(quantized_encoder_path):
    quantized_encoder_size = os.path.getsize(quantized_encoder_path) / (1024 * 1024)
    print(f"量化后编码器模型大小: {quantized_encoder_size:.2f} MB")
    print(f"编码器模型减少: {((original_encoder_size - quantized_encoder_size) / original_encoder_size * 100):.2f}%")

if os.path.exists(quantized_decoder_path):
    quantized_decoder_size = os.path.getsize(quantized_decoder_path) / (1024 * 1024)
    print(f"量化后解码器模型大小: {quantized_decoder_size:.2f} MB")
    print(f"解码器模型减少: {((original_decoder_size - quantized_decoder_size) / original_decoder_size * 100):.2f}%")

if os.path.exists(quantized_encoder_path) and os.path.exists(quantized_decoder_path):
    total_original = original_encoder_size + original_decoder_size
    total_quantized = quantized_encoder_size + quantized_decoder_size
    print(f"\n总原始大小: {total_original:.2f} MB")
    print(f"总量化大小: {total_quantized:.2f} MB")
    print(f"总体减少: {((total_original - total_quantized) / total_original * 100):.2f}%")

print("\n量化完成！")