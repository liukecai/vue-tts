class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = (event) => {
      // 处理来自主线程的消息
    };
  }

  process(inputs, outputs, parameters) {
    // 处理音频数据
    if (inputs.length > 0 && inputs[0].length > 0) {
      const inputData = inputs[0][0];
      // 发送音频数据到主线程
      this.port.postMessage({ audioData: inputData });
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);