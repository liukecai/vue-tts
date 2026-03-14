import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import VoiceRecognitionPage from '../views/VoiceRecognitionPage.vue';

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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;