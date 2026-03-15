import json

# 读取tokens.json文件
with open('/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/tokens.json', 'r', encoding='utf-8') as f:
    tokens = json.load(f)

# 创建vocab字典
vocab = {}
for i, token in enumerate(tokens):
    vocab[token] = i

# 创建完整的tokenizer.json结构
tokenizer_json = {
    "version": "1.0",
    "truncation": "longest_first",
    "padding": "longest",
    "normalizer": {
        "type": "BertNormalizer",
        "clean_text": True,
        "handle_chinese_chars": True,
        "strip_accents": False,
        "lowercase": False
    },
    "pre_tokenizer": {
        "type": "WhitespacePreTokenizer"
    },
    "model": {
        "type": "SentencePiece",
        "vocab": vocab
    }
}

# 写入tokenizer.json文件
with open('/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/tokenizer.json', 'w', encoding='utf-8') as f:
    json.dump(tokenizer_json, f, ensure_ascii=False, indent=2)

print("tokenizer.json generated successfully!")
