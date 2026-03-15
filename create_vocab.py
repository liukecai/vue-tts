import json

# 读取 tokens.json
tokens_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/tokens.json"
with open(tokens_path, 'r', encoding='utf-8') as f:
    tokens = json.load(f)

# 创建 vocab.json
vocab = {}
for i, token in enumerate(tokens):
    vocab[token] = i

# 保存为 vocab.json
vocab_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/vocab.json"
with open(vocab_path, 'w', encoding='utf-8') as f:
    json.dump(vocab, f, indent=2, ensure_ascii=False)

print(f"Vocab file created at {vocab_path}")
print(f"Vocabulary size: {len(vocab)}")

# 创建 tokenizer.json
tokenizer_data = {
    "version": "1.0",
    "truncation": "longest_first",
    "padding": "longest",
    "model": {
        "type": "SentencePiece",
        "vocab": vocab
    }
}

tokenizer_path = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/tokenizer.json"
with open(tokenizer_path, 'w', encoding='utf-8') as f:
    json.dump(tokenizer_data, f, indent=2, ensure_ascii=False)

print(f"Tokenizer file created at {tokenizer_path}")
print("\nVocabulary and tokenizer files created successfully!")