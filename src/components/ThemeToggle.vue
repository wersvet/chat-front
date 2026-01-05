<template>
  <button class="theme-toggle" :aria-label="`Переключить тему: ${themeLabel}`" @click="toggle">
    <span class="theme-toggle__icon" aria-hidden="true">{{ themeIcon }}</span>
    <span class="theme-toggle__label">{{ themeLabel }}</span>
  </button>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const THEME_KEY = 'chat-theme';
const theme = ref('light');

const applyTheme = (value) => {
  const normalized = value === 'dark' ? 'dark' : 'light';
  theme.value = normalized;
  document.documentElement.setAttribute('data-theme', normalized);
  localStorage.setItem(THEME_KEY, normalized);
};

const toggle = () => applyTheme(theme.value === 'light' ? 'dark' : 'light');

const themeLabel = computed(() => (theme.value === 'light' ? 'Светлая' : 'Тёмная'));
const themeIcon = computed(() => (theme.value === 'light' ? '☀️' : '🌙'));

onMounted(() => {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || 'light');
});
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-weight: 600;
  box-shadow: 0 8px 26px rgba(15, 23, 42, 0.08);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.theme-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.25);
}

.theme-toggle__icon {
  font-size: 1.1rem;
  line-height: 1;
}

.theme-toggle__label {
  font-size: 0.95rem;
}
</style>
