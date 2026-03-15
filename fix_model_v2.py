import onnx
import numpy as np

# 加载模型
model_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/model.onnx"
model = onnx.load(model_path)

print("Model loaded, checking for type issues...")

# 遍历所有节点，检查类型不匹配的问题
for i, node in enumerate(model.graph.node):
    if node.op_type == "Add":
        # 检查 Add 节点的输入类型
        for input_name in node.input:
            # 查找输入的类型
            for value_info in model.graph.value_info:
                if value_info.name == input_name:
                    print(f"Node {i} ({node.op_type}) input {input_name} type: {value_info.type}")
            for input in model.graph.input:
                if input.name == input_name:
                    print(f"Node {i} ({node.op_type}) input {input_name} type: {input.type}")

print("\nModel analysis completed. Creating a simplified version...")

# 保存原始模型
original_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/model_original.onnx"
onnx.save(model, original_path)
print(f"Original model saved to {original_path}")

# 尝试使用 onnx.shape_inference 来修复模型
print("Running shape inference...")
try:
    inferred_model = onnx.shape_inference.infer_shapes(model)
    inferred_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/model_inferred.onnx"
    onnx.save(inferred_model, inferred_path)
    print(f"Shape inference completed. Model saved to {inferred_path}")
    
except Exception as e:
    print(f"Shape inference failed: {e}")

print("\nModel fix attempt completed!")