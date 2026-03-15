import onnx
from onnx.shape_inference import infer_shapes
import os

# 修复模型形状推断问题
def fix_model_shape(model_path, output_path):
    print(f"修复模型形状: {model_path}")
    
    # 加载模型
    model = onnx.load(model_path)
    
    # 运行形状推断
    print("运行形状推断...")
    inferred_model = infer_shapes(model)
    
    # 保存修复后的模型
    onnx.save(inferred_model, output_path)
    print(f"修复后的模型保存到: {output_path}")

# 修复编码器和解码器模型
model_dir = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx/quantized"
fixed_encoder_path = os.path.join(model_dir, "encoder_model_q4_fixed.onnx")
fixed_decoder_path = os.path.join(model_dir, "decoder_model_merged_q4_fixed.onnx")

shape_fixed_encoder_path = os.path.join(model_dir, "encoder_model_q4_shape_fixed.onnx")
shape_fixed_decoder_path = os.path.join(model_dir, "decoder_model_merged_q4_shape_fixed.onnx")

# 修复编码器模型
fix_model_shape(fixed_encoder_path, shape_fixed_encoder_path)

# 修复解码器模型
fix_model_shape(fixed_decoder_path, shape_fixed_decoder_path)

print("\n模型形状修复完成！")