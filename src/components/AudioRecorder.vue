<template>
  <div class="audio-recorder">
    <div class="recorder-controls">
      <button
        v-if="!state.isRecording && !audioBlob"
        @click="startRecording"
        :disabled="isLoading"
        class="btn btn-primary"
      >
        <span class="icon">🎤</span>
        <span>开始录音</span>
      </button>

      <template v-else-if="state.isRecording">
        <button
          v-if="!state.isPaused"
          @click="pauseRecording"
          class="btn btn-warning"
        >
          <span class="icon">⏸️</span>
          <span>暂停</span>
        </button>
        <button
          v-else
          @click="resumeRecording"
          class="btn btn-success"
        >
          <span class="icon">▶️</span>
          <span>继续</span>
        </button>

        <button
          @click="stopRecording"
          class="btn btn-danger"
        >
          <span class="icon">⏹️</span>
          <span>停止</span>
        </button>
      </template>

      <template v-else-if="audioBlob">
        <button
          @click="startNewRecording"
          class="btn btn-primary"
        >
          <span class="icon">🎤</span>
          <span>重新录制</span>
        </button>
      </template>
    </div>

    <div v-if="state.isRecording" class="recorder-info">
      <div class="duration">
        <span class="label">时长:</span>
        <span class="value">{{ formatDuration(state.duration) }}</span>
      </div>
      <div v-if="state.isPaused" class="status paused">
        已暂停
      </div>
      <div v-else class="status recording">
        <span class="indicator"></span>
        录音中...
      </div>
    </div>

    <div v-if="audioBlob && !state.isRecording" class="audio-player">
      <div class="player-header">
        <h3>🎵 录音回放</h3>
        <div class="player-controls">
          <button
            v-if="!playbackState.isPlaying"
            @click="playAudio"
            class="btn-play"
            :disabled="playbackState.isLoading"
          >
            <span class="icon">▶️</span>
            <span>播放</span>
          </button>
          <button
            v-else
            @click="pausePlayback"
            class="btn-pause"
          >
            <span class="icon">⏸️</span>
            <span>暂停</span>
          </button>
          <button
            @click="stopPlayback"
            class="btn-stop"
          >
            <span class="icon">⏹️</span>
            <span>停止</span>
          </button>
        </div>
      </div>

      <div class="player-progress">
        <div class="time-display">
          <span class="current-time">{{ formatDuration(playbackState.currentTime) }}</span>
          <span class="separator">/</span>
          <span class="total-time">{{ formatDuration(playbackState.duration) }}</span>
        </div>
        <div class="progress-bar-container">
          <div 
            class="progress-track"
            @click="seekAudio"
            ref="progressTrack"
          >
            <div 
              class="progress-fill" 
              :style="{ width: playbackProgress + '%' }"
            ></div>
            <div 
              class="progress-thumb"
              :style="{ left: playbackProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <div class="audio-visualizer">
        <canvas ref="visualizerCanvas" class="visualizer-canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { audioRecorderService } from '../services/audioRecorder';
import type { AudioRecorderState } from '../types';

const props = defineProps<{
  audioBlob?: Blob;
}>();

const emit = defineEmits<{
  recordingStarted: [];
  recordingStopped: [blob: Blob];
  recordingPaused: [];
  recordingResumed: [];
  timeUpdate: [duration: number];
}>();

const state = ref<AudioRecorderState>({
  isRecording: false,
  isPaused: false,
  duration: 0
});

const isLoading = ref(false);

const playbackState = ref({
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  currentTime: 0,
  duration: 0
});

const audioElement = ref<HTMLAudioElement | null>(null);
const audioContext = ref<AudioContext | null>(null);
const analyser = ref<AnalyserNode | null>(null);
const visualizerCanvas = ref<HTMLCanvasElement | null>(null);
const progressTrack = ref<HTMLElement | null>(null);

const playbackProgress = ref(0);

const startRecording = async () => {
  try {
    isLoading.value = true;
    stopPlayback();
    await audioRecorderService.startRecording();
    state.value = audioRecorderService.getState();
    console.log('recording started');
    emit('recordingStarted');
  } catch (error) {
    console.error('Failed to start recording:', error);
    alert('无法访问麦克风，请检查权限设置');
  } finally {
    isLoading.value = false;
  }
};

const stopRecording = async () => {
  const blob = await audioRecorderService.stopRecording();
  state.value = audioRecorderService.getState();
  emit('recordingStopped', blob);
};

const pauseRecording = () => {
  audioRecorderService.pauseRecording();
  state.value = audioRecorderService.getState();
  emit('recordingPaused');
};

const resumeRecording = () => {
  audioRecorderService.resumeRecording();
  state.value = audioRecorderService.getState();
  emit('recordingResumed');
};

const startNewRecording = async () => {
  stopPlayback();
  await startRecording();
};

const playAudio = async () => {
  if (!props.audioBlob) return;

  try {
    playbackState.value.isLoading = true;
    
    const audioUrl = URL.createObjectURL(props.audioBlob);
    
    if (audioElement.value) {
      audioElement.value.src = audioUrl;
      await audioElement.value.play();
      playbackState.value.isPlaying = true;
      playbackState.value.isPaused = false;
    }
  } catch (error) {
    console.error('Failed to play audio:', error);
    alert('播放音频失败，请重试');
  } finally {
    playbackState.value.isLoading = false;
  }
};

const pausePlayback = () => {
  if (audioElement.value && playbackState.value.isPlaying) {
    audioElement.value.pause();
    playbackState.value.isPlaying = false;
    playbackState.value.isPaused = true;
  }
};

const stopPlayback = () => {
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.currentTime = 0;
    playbackState.value.isPlaying = false;
    playbackState.value.isPaused = false;
    playbackState.value.currentTime = 0;
    playbackProgress.value = 0;
  }
};

const seekAudio = (event: MouseEvent) => {
  if (!progressTrack.value || !props.audioBlob) return;

  const rect = progressTrack.value.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));

  if (audioElement.value) {
    audioElement.value.currentTime = (percentage / 100) * playbackState.value.duration;
  }
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const updatePlaybackProgress = () => {
  if (audioElement.value && playbackState.value.duration > 0) {
    playbackState.value.currentTime = audioElement.value.currentTime;
    playbackProgress.value = (audioElement.value.currentTime / playbackState.value.duration) * 100;
  }
};

const setupAudioContext = async () => {
  if (!props.audioBlob) return;

  try {
    audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyser.value = audioContext.value.createAnalyser();
    analyser.value.fftSize = 256;

    const audioUrl = URL.createObjectURL(props.audioBlob);
    const audio = new Audio(audioUrl);
    audioElement.value = audio;

    const source = audioContext.value.createMediaElementSource(audio);
    source.connect(analyser.value);
    analyser.value.connect(audioContext.value.destination);

    audio.addEventListener('loadedmetadata', () => {
      playbackState.value.duration = audio.duration;
    });

    audio.addEventListener('timeupdate', updatePlaybackProgress);
    audio.addEventListener('ended', () => {
      playbackState.value.isPlaying = false;
      playbackState.value.isPaused = false;
      playbackState.value.currentTime = 0;
      playbackProgress.value = 0;
    });
  } catch (error) {
    console.error('Failed to setup audio context:', error);
  }
};

const drawVisualizer = () => {
  if (!analyser.value || !visualizerCanvas.value) return;

  const canvas = visualizerCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const bufferLength = analyser.value.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const draw = () => {
    requestAnimationFrame(draw);

    analyser.value.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height;

      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  draw();
};

watch(() => props.audioBlob, (newBlob) => {
  if (newBlob) {
    stopPlayback();
    setupAudioContext();
    drawVisualizer();
  }
});

onMounted(() => {
  audioRecorderService.on('stateChange', (newState: AudioRecorderState) => {
    state.value = newState;
  });

  audioRecorderService.on('timeUpdate', (duration: number) => {
    state.value.duration = duration;
    emit('timeUpdate', duration);
  });
});

onUnmounted(() => {
  stopPlayback();
  audioRecorderService.cleanup();
  
  if (audioContext.value) {
    audioContext.value.close();
  }
  
  if (audioElement.value) {
    URL.revokeObjectURL(audioElement.value.src);
  }
});
</script>

<style scoped>
.audio-recorder {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.recorder-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-warning:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(250, 112, 154, 0.4);
}

.icon {
  font-size: 1rem;
}

.recorder-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

.duration {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.duration .label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.duration .value {
  color: white;
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 600;
}

.status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status.recording {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.status.recording .indicator {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status.paused {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.audio-player {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.player-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}

.player-controls {
  display: flex;
  gap: 0.5rem;
}

.player-progress {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.time-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.time-display .current-time {
  color: white;
  font-weight: 600;
}

.time-display .separator {
  color: rgba(255, 255, 255, 0.5);
}

.time-display .total-time {
  color: rgba(255, 255, 255, 0.6);
}

.progress-bar-container {
  width: 100%;
}

.progress-track {
  position: relative;
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.progress-track:hover {
  background: rgba(255, 255, 255, 0.15);
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.1s linear;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: left 0.1s linear;
}

.audio-visualizer {
  margin-top: 1rem;
}

.visualizer-canvas {
  width: 100%;
  height: 80px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
}
</style>
