<template>
  <div class="home">
    <header class="header">
      <h1>🎙️ Web 语音识别</h1>
      <p class="subtitle">基于 Whisper 的浏览器端语音转文字</p>
    </header>

    <main class="main">
      <div class="hero">
        <h2>欢迎使用 Web 语音识别</h2>
        <p class="description">
          快速、准确的语音识别工具，支持多种语言，完全在浏览器端运行，保护您的隐私
        </p>
        <router-link to="/voice-recognition" class="btn-primary">
          开始录音识别
        </router-link>
      </div>

      <div class="features">
        <div class="feature-item">
          <div class="feature-icon">🎯</div>
          <h3>高精度识别</h3>
          <p>基于 Whisper 模型，提供准确的语音识别结果</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🔒</div>
          <h3>隐私保护</h3>
          <p>所有处理都在本地进行，不会上传您的语音数据</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🌐</div>
          <h3>多语言支持</h3>
          <p>支持中文、英文等多种语言的语音识别</p>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>基于 Vue3 + TypeScript + ONNX.js + Whisper 构建</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 首页组件
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
}

.header {
  text-align: center;
  padding: 2rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}

.main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1rem;
  width: 100%;
  box-sizing: border-box;
}

.hero {
  text-align: center;
  margin-bottom: 4rem;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hero h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.description {
  margin: 0 0 2rem 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.125rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.btn-primary {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-item {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-item h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.feature-item p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.footer {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer p {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .hero {
    padding: 2rem 1rem;
  }
  
  .hero h2 {
    font-size: 1.75rem;
  }
  
  .description {
    font-size: 1rem;
  }
  
  .btn-primary {
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
  }
}
</style>