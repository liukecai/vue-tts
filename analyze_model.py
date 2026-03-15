import onnx
import json

# 加载模型
model_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/model.onnx"
model = onnx.load(model_path)

# 分析模型结构
print("Model structure analysis:")
print(f"Number of nodes: {len(model.graph.node)}")
print(f"Number of inputs: {len(model.graph.input)}")
print(f"Number of outputs: {len(model.graph.output)}")

# 检查是否有初始izer
print(f"Number of initializers: {len(model.graph.initializer)}")

# 保存模型信息到文件
model_info = {
    "ir_version": model.ir_version,
    "producer_name": model.producer_name,
    "producer_version": model.producer_version,
    "model_version": model.model_version,
    "num_nodes": len(model.graph.node),
    "num_inputs": len(model.graph.input),
    "num_outputs": len(model.graph.output),
    "num_initializers": len(model.graph.initializer),
    "inputs": [
        {
            "name": input.name,
            "type": str(input.type)
        }
        for input in model.graph.input
    ],
    "outputs": [
        {
            "name": output.name,
            "type": str(output.type)
        }
        for output in model.graph.output
    ]
}

with open("model_info.json", "w") as f:
    json.dump(model_info, f, indent=2)

print("\nModel information saved to model_info.json")
print("\nAnalysis completed.")