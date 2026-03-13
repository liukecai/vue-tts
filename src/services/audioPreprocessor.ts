import type { WhisperModelConfig } from '../types';

export class AudioPreprocessor {
  private config: WhisperModelConfig;

  constructor(config: WhisperModelConfig) {
    this.config = config;
  }

  async processAudio(audioBlob: Blob): Promise<Float32Array> {
    const audioContext = new AudioContext({ sampleRate: this.config.sampleRate });
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const audioData = this.extractChannel(audioBuffer);
    const paddedData = this.padAudio(audioData);

    audioContext.close();

    return paddedData;
  }

  private extractChannel(audioBuffer: AudioBuffer): Float32Array {
    if (audioBuffer.numberOfChannels === 1) {
      return audioBuffer.getChannelData(0);
    }

    const channelData = audioBuffer.getChannelData(0);
    const length = audioBuffer.length;
    const monoData = new Float32Array(length);

    for (let i = 0; i < length; i++) {
      monoData[i] = channelData[i];
    }

    return monoData;
  }

  private padAudio(audioData: Float32Array): Float32Array {
    const chunkLengthSamples = this.config.chunkLength * this.config.sampleRate;
    
    if (audioData.length >= chunkLengthSamples) {
      return audioData.slice(0, chunkLengthSamples);
    }

    const paddedData = new Float32Array(chunkLengthSamples);
    paddedData.set(audioData);
    return paddedData;
  }

  computeMelSpectrogram(audioData: Float32Array): Float32Array {
    const nFFT = this.config.nFFT;
    const hopLength = this.config.hopLength;
    const nMelFilters = this.config.nMelFilters;

    const numFrames = Math.floor((audioData.length - nFFT) / hopLength) + 1;
    const melSpectrogram = new Float32Array(numFrames * nMelFilters);

    const melFilters = this.createMelFilters(nMelFilters, nFFT, this.config.sampleRate);

    for (let frame = 0; frame < numFrames; frame++) {
      const start = frame * hopLength;
      const frameData = audioData.slice(start, start + nFFT);

      const fftResult = this.computeFFT(frameData);
      const melEnergies = this.applyMelFilters(fftResult, melFilters);

      const melLog = this.logMel(melEnergies);
      melSpectrogram.set(melLog, frame * nMelFilters);
    }

    return melSpectrogram;
  }

  private createMelFilters(nMelFilters: number, nFFT: number, sampleRate: number): Float32Array {
    const filters = new Float32Array(nMelFilters * (nFFT / 2 + 1));
    const nyquist = sampleRate / 2;
    const melMin = this.hzToMel(0);
    const melMax = this.hzToMel(nyquist);
    const melPoints = new Array(nMelFilters + 2);

    for (let i = 0; i < nMelFilters + 2; i++) {
      const mel = melMin + (melMax - melMin) * i / (nMelFilters + 1);
      melPoints[i] = this.melToHz(mel);
    }

    for (let m = 0; m < nMelFilters; m++) {
      for (let k = 0; k <= nFFT / 2; k++) {
        const hz = k * sampleRate / nFFT;
        let value = 0;

        if (hz >= melPoints[m] && hz <= melPoints[m + 1]) {
          value = (hz - melPoints[m]) / (melPoints[m + 1] - melPoints[m]);
        } else if (hz >= melPoints[m + 1] && hz <= melPoints[m + 2]) {
          value = (melPoints[m + 2] - hz) / (melPoints[m + 2] - melPoints[m + 1]);
        }

        filters[m * (nFFT / 2 + 1) + k] = value;
      }
    }

    return filters;
  }

  private hzToMel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700);
  }

  private melToHz(mel: number): number {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  }

  private computeFFT(input: Float32Array): Float32Array {
    const n = input.length;
    const output = new Float32Array(n);

    for (let k = 0; k < n; k++) {
      let real = 0;
      let imag = 0;

      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * k * t) / n;
        real += input[t] * Math.cos(angle);
        imag -= input[t] * Math.sin(angle);
      }

      output[k] = Math.sqrt(real * real + imag * imag);
    }

    return output;
  }

  private applyMelFilters(fftResult: Float32Array, melFilters: Float32Array): Float32Array {
    const nMelFilters = melFilters.length / (fftResult.length);
    const melEnergies = new Float32Array(nMelFilters);

    for (let m = 0; m < nMelFilters; m++) {
      let energy = 0;
      for (let k = 0; k < fftResult.length; k++) {
        energy += fftResult[k] * melFilters[m * fftResult.length + k];
      }
      melEnergies[m] = energy;
    }

    return melEnergies;
  }

  private logMel(melEnergies: Float32Array): Float32Array {
    const logMel = new Float32Array(melEnergies.length);
    for (let i = 0; i < melEnergies.length; i++) {
      logMel[i] = Math.log10(Math.max(melEnergies[i], 1e-10));
    }
    return logMel;
  }
}

export const createAudioPreprocessor = (config: WhisperModelConfig) => {
  return new AudioPreprocessor(config);
};
