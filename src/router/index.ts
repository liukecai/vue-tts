import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import VoiceRecognitionPage from '../views/VoiceRecognitionPage.vue';
import RealtimeVoiceRecognitionPage from '../views/RealtimeVoiceRecognitionPage.vue';
import VoiceIntentRecognitionPage from '../views/VoiceIntentRecognitionPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/voice-recognition',
    name: 'VoiceRecognition',
    component: VoiceRecognitionPage
  },
  {
    path: '/realtime-voice',
    name: 'RealtimeVoice',
    component: RealtimeVoiceRecognitionPage
  },
  {
    path: '/voice-intent',
    name: 'VoiceIntent',
    component: VoiceIntentRecognitionPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;