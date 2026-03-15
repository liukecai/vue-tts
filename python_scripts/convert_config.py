import yaml
import json
import os

# 读取 YAML 配置
yaml_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/config.yaml"
with open(yaml_path, 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

# 转换为 JSON 格式（whisper模型格式）
json_config = {
    "model_type": "whisper",
    "encoder": "WhisperEncoder",
    "decoder": "WhisperDecoder",
    "model_conf": config.get("model_conf", {})
}

# 保存为 config.json
json_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/config.json"
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(json_config, f, indent=2, ensure_ascii=False)

print(f"Config converted to {json_path}")

# 创建 preprocessor_config.json（whisper模型格式）
preprocessor_config = {
    "chunk_length": 30,
    "feature_extractor_type": "WhisperFeatureExtractor",
    "feature_size": 80,
    "hop_length": 160,
    "n_fft": 400,
    "n_samples": 480000,
    "nb_max_frames": 3000,
    "padding_side": "right",
    "padding_value": 0.0,
    "processor_class": "WhisperProcessor",
    "return_attention_mask": False,
    "sampling_rate": 16000
}

preprocessor_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/preprocessor_config.json"
with open(preprocessor_path, 'w', encoding='utf-8') as f:
    json.dump(preprocessor_config, f, indent=2, ensure_ascii=False)

print(f"Preprocessor config created at {preprocessor_path}")

# 创建 tokenizer_config.json（whisper模型格式）
tokenizer_config = {
    "tokenizer_type": "SentencepieceTokenizer",
    "unk_token": "<unk>",
    "bos_token": "<s>",
    "eos_token": "</s>"
}

tokenizer_config_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/tokenizer_config.json"
with open(tokenizer_config_path, 'w', encoding='utf-8') as f:
    json.dump(tokenizer_config, f, indent=2, ensure_ascii=False)

print(f"Tokenizer config created at {tokenizer_config_path}")

# 创建 special_tokens_map.json（whisper模型格式）
special_tokens_map = {
    "unk_token": "<unk>",
    "bos_token": "<s>",
    "eos_token": "</s>"
}

special_tokens_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/special_tokens_map.json"
with open(special_tokens_path, 'w', encoding='utf-8') as f:
    json.dump(special_tokens_map, f, indent=2, ensure_ascii=False)

print(f"Special tokens map created at {special_tokens_path}")

# 检查 tokens.json 是否存在
if os.path.exists("/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/tokens.json"):
    print("tokens.json already exists")
else:
    print("tokens.json not found, skipping")

print("\nConfiguration files processed successfully!")