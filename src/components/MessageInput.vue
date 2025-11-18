<template>
  <form @submit.prevent="submit" class="card" style="margin-top: 0.8rem;">
    <label>Message</label>
    <textarea v-model="text" placeholder="Type your message" required></textarea>
    <div class="form-actions">
      <button type="submit" :disabled="!text.trim()">Send</button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  onSend: {
    type: Function,
    required: true
  }
});

const text = ref('');

const submit = async () => {
  if (!text.value.trim()) return;
  await props.onSend(text.value.trim());
  text.value = '';
};

watch(() => props.onSend, () => {
  text.value = '';
});
</script>