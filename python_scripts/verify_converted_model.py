import onnxruntime as ort
import numpy as np
import os

# 验证编码器模型
encoder_model_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx/encoder_model_fp16.onnx"
decoder_model_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx/decoder_model_merged_fp16.onnx"

print("Verifying encoder model...")
try:
    # 加载编码器模型
    encoder_session = ort.InferenceSession(encoder_model_path)
    print("✓ Encoder model loaded successfully")
    
    # 打印输入输出信息
    print("\nEncoder model inputs:")
    for input in encoder_session.get_inputs():
        print(f"  - {input.name}: {input.shape}")
    
    print("\nEncoder model outputs:")
    for output in encoder_session.get_outputs():
        print(f"  - {output.name}: {output.shape}")
    
    # 创建测试输入
    # 输入形状: [1, 1, sequence_length, 560]
    test_input = np.random.randn(1, 1, 100, 560).astype(np.float32)
    speech_lengths = np.array([[100]]).astype(np.int64)
    language = np.array([[0]]).astype(np.int64)
    textnorm = np.array([[0]]).astype(np.int64)
    
    # 运行模型
    print("\nRunning encoder model with test input...")
    encoder_outputs = encoder_session.run(
        None,
        {
            "speech": test_input,
            "speech_lengths": speech_lengths,
            "language": language,
            "textnorm": textnorm
        }
    )
    
    print("✓ Encoder model inference successful")
    print(f"Encoder output shape: {encoder_outputs[0].shape}")
    print(f"Encoder output lens shape: {encoder_outputs[1].shape}")
    
except Exception as e:
    print(f"✗ Encoder model verification failed: {e}")

print("\n" + "="*50 + "\n")

print("Verifying decoder model...")
try:
    # 加载解码器模型
    decoder_session = ort.InferenceSession(decoder_model_path)
    print("✓ Decoder model loaded successfully")
    
    # 打印输入输出信息
    print("\nDecoder model inputs:")
    for input in decoder_session.get_inputs():
        print(f"  - {input.name}: {input.shape}")
    
    print("\nDecoder model outputs:")
    for output in decoder_session.get_outputs():
        print(f"  - {output.name}: {output.shape}")
    
    # 使用与编码器相同的测试输入
    print("\nRunning decoder model with test input...")
    decoder_outputs = decoder_session.run(
        None,
        {
            "speech": test_input,
            "speech_lengths": speech_lengths,
            "language": language,
            "textnorm": textnorm
        }
    )
    
    print("✓ Decoder model inference successful")
    print(f"Decoder output shape: {decoder_outputs[0].shape}")
    print(f"Decoder output lens shape: {decoder_outputs[1].shape}")
    
except Exception as e:
    print(f"✗ Decoder model verification failed: {e}")

print("\n" + "="*50 + "\n")

# 验证配置文件
print("Verifying configuration files...")

config_files = [
    "config.json",
    "preprocessor_config.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "special_tokens_map.json",
    "vocab.json"
]

model_dir = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx"

for file_name in config_files:
    file_path = os.path.join(model_dir, file_name)
    if os.path.exists(file_path):
        print(f"✓ {file_name} exists")
    else:
        print(f"✗ {file_name} missing")

print("\nModel verification completed!")