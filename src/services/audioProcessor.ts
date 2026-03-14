export class AudioPreprocessor {
  private targetSampleRate = 16000;
  private nFFT = 400;
  private hopLength = 160;
  private nMelFilters = 80;

  async processAudio(audioBlob: Blob): Promise<Float32Array> {
    const audioContext = new AudioContext({ sampleRate: this.targetSampleRate });
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const audioData = this.extractChannel(audioBuffer);
    const resampledData = this.resample(audioData, audioBuffer.sampleRate, this.targetSampleRate);
    const paddedData = this.padAudio(resampledData, 30 * this.targetSampleRate);

    audioContext.close();

    return paddedData;
  }

  private extractChannel(audioBuffer: AudioBuffer): Float32Array {
    if (audioBuffer.numberOfChannels === 1) {
      return audioBuffer.getChannelData(0);
    }

    const channelData = audioBuffer.getChannelData(0);
    return channelData;
  }

  private resample(audioData: Float32Array, originalSampleRate: number, targetSampleRate: number): Float32Array {
    if (originalSampleRate === targetSampleRate) {
      return audioData;
    }

    const ratio = originalSampleRate / targetSampleRate;
    const newLength = Math.floor(audioData.length * ratio);
    const resampledData = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const srcIndex = Math.floor(i / ratio);
      const weight = (i / ratio) - srcIndex;
      const srcIndex2 = Math.min(srcIndex + 1, audioData.length - 1);
      
      resampledData[i] = audioData[srcIndex] * (1 - weight) + audioData[srcIndex2] * weight;
    }

    return resampledData;
  }

  private padAudio(audioData: Float32Array, targetLength: number): Float32Array {
    if (audioData.length >= targetLength) {
      return audioData.slice(0, targetLength);
    }

    const paddedData = new Float32Array(targetLength);
    paddedData.set(audioData);

    return paddedData;
  }

  computeLogMelSpectrogram(audioData: Float32Array): Float32Array {
    const nFrames = Math.floor((audioData.length - this.nFFT) / this.hopLength) + 1;
    const melSpectrogram = new Float32Array(nFrames * this.nMelFilters);

    for (let frame = 0; frame < nFrames; frame++) {
      const start = frame * this.hopLength;
      const frameData = audioData.slice(start, start + this.nFFT);

      const fftResult = this.computeFFT(frameData);
      const melEnergies = this.applyMelFilters(fftResult);

      for (let mel = 0; mel < this.nMelFilters; mel++) {
        melSpectrogram[frame * this.nMelFilters + mel] = Math.log10(Math.max(melEnergies[mel], 1e-10));
      }
    }

    return melSpectrogram;
  }

  private computeFFT(audioData: Float32Array): Float32Array {
    const fftSize = this.nFFT;
    const fftResult = new Float32Array(fftSize / 2 + 1);

    for (let k = 0; k <= fftSize / 2; k++) {
      let real = 0;
      let imag = 0;

      for (let n = 0; n < fftSize; n++) {
        const angle = (2 * Math.PI * k * n) / fftSize;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        real += audioData[n] * cos;
        imag += audioData[n] * sin;
      }

      fftResult[k] = real;
      fftResult[k + fftSize / 2 + 1] = imag;
    }

    return fftResult;
  }

  private applyMelFilters(fftResult: Float32Array): Float32Array {
    const melEnergies = new Float32Array(this.nMelFilters);
    const fftSize = this.nFFT;

    for (let mel = 0; mel < this.nMelFilters; mel++) {
      const melMin = this.hzToMel(0);
      const melMax = this.hzToMel(this.targetSampleRate / 2);
      const melStep = (melMax - melMin) / (this.nMelFilters - 1);

      let energy = 0;
      for (let k = 0; k < fftSize / 2 + 1; k++) {
        const hz = k * this.targetSampleRate / fftSize;
        const mel = this.hzToMel(hz);

        if (mel >= melMin && mel <= melMax) {
          const melIndex = Math.min(Math.floor((mel - melMin) / melStep), this.nMelFilters - 1);
          energy += fftResult[k] * (1 - Math.abs(mel - (melMin + melIndex * melStep)));
        }
      }

      melEnergies[mel] = energy;
    }

    return melEnergies;
  }

  private hzToMel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700);
  }
}

export const createAudioPreprocessor = () => {
  return new AudioPreprocessor();
};
