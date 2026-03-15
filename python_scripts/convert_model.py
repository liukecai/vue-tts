import os
import shutil
import onnx

# 源模型路径
source_model_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/model.onnx"
# 目标目录
target_dir = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx"

# 确保目标目录存在
os.makedirs(target_dir, exist_ok=True)

# 复制模型到目标目录
print(f"Copying model from {source_model_path} to {target_dir}...")

# 复制为 encoder_model_fp16.onnx
encoder_target_path = os.path.join(target_dir, "encoder_model_fp16.onnx")
shutil.copy2(source_model_path, encoder_target_path)
print(f"Copied model to {encoder_target_path}")

# 复制为 decoder_model_merged_fp16.onnx (由于是单一模型，我们同时用于编码器和解码器)
decoder_target_path = os.path.join(target_dir, "decoder_model_merged_fp16.onnx")
shutil.copy2(source_model_path, decoder_target_path)
print(f"Copied model to {decoder_target_path}")

# 验证复制的模型
print("\nVerifying copied models...")

for model_path in [encoder_target_path, decoder_target_path]:
    try:
        model = onnx.load(model_path)
        onnx.checker.check_model(model)
        print(f"✓ {os.path.basename(model_path)}: valid ONNX model")
    except Exception as e:
        print(f"✗ {os.path.basename(model_path)}: {e}")

print("\nModel conversion completed!")