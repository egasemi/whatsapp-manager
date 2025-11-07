<template>
    <form @submit.prevent="sendMessage" class="message-form">
      <input
        v-model="to"
        placeholder="Número (ej: 549341xxxxxxx@c.us)"
        class="input"
      />
      <input v-model="message" placeholder="Mensaje" class="input" />
      <button class="button">Enviar</button>
    </form>
  </template>
  
  <script setup>
  import axios from '../api/axios';
  import { ref } from 'vue';
  
  const props = defineProps({ sessionId: String });
  const to = ref('');
  const message = ref('');
  
  const sendMessage = async () => {
    if (!to.value || !message.value) return;
    await axios.post('/messages/send', {
      sessionId: props.sessionId,
      to: to.value,
      message: message.value,
    });
    message.value = '';
  };
  </script>
  
  <style scoped>
  input {
    margin-bottom: 1rem;
  }
  </style>
  