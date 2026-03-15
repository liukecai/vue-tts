import os
import json
from transformers import AutoTokenizer, AutoProcessor

# 模型路径
model_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx"

print("Testing tokenizer loading...")
try:
    # 尝试加载tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    print("✓ Tokenizer loaded successfully!")
    
    # 测试tokenizer基本功能
    test_text = "Hello, how are you?"
    tokens = tokenizer.tokenize(test_text)
    print(f"Test text: {test_text}")
    print(f"Tokenized: {tokens}")
    
    # 尝试加载processor
    print("\nTesting processor loading...")
    processor = AutoProcessor.from_pretrained(model_path)
    print("✓ Processor loaded successfully!")
    
    print("\nAll tests passed! The model configuration is correct.")
    
except Exception as e:
    print(f"✗ Error loading model: {e}")
    import traceback
    traceback.print_exc()
