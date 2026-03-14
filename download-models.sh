#!/bin/bash

# Create models directory if it doesn't exist
mkdir -p public/models/whisper-tiny/onnx

# Download models from Hugging Face
MODEL_URL="https://huggingface.co/Xenova/whisper-tiny/resolve/main/onnx"

# Download essential model files
files=("encoder_model.onnx" "decoder_model.onnx")

for file in "${files[@]}"; do
    echo "Downloading $file..."
    curl -o "public/models/whisper-tiny/onnx/$file" "$MODEL_URL/$file"
    if [ $? -ne 0 ]; then
        echo "Failed to download $file"
        exit 1
    fi
done

echo "Model download completed successfully!"
