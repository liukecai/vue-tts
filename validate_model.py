import onnx
import sys

# 加载模型
model_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/model.onnx"

print(f"Loading model from {model_path}...")
try:
    model = onnx.load(model_path)
    print("Model loaded successfully!")
    
    # 验证模型
    print("Validating model...")
    onnx.checker.check_model(model)
    print("Model validation passed!")
    
    # 打印模型信息
    print("\nModel information:")
    print(f"Model IR version: {model.ir_version}")
    print(f"Model producer: {model.producer_name}")
    print(f"Model producer version: {model.producer_version}")
    print(f"Model domain: {model.domain}")
    print(f"Model model version: {model.model_version}")
    print(f"Model doc string: {model.doc_string}")
    
    # 打印输入和输出
    print("\nInputs:")
    for i, input in enumerate(model.graph.input):
        print(f"Input {i}: {input.name} - {input.type}")
    
    print("\nOutputs:")
    for i, output in enumerate(model.graph.output):
        print(f"Output {i}: {output.name} - {output.type}")
    
    print("\nModel validation completed successfully!")
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)