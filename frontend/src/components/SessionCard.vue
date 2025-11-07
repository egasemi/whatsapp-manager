<template>
    <div class="card session-card">
      <div class="session-header">
        <h3>{{ session.sessionId }}</h3>
  
        <div class="session-actions">
          <button
            v-if="session.status == 'conectado'"
            class="logout-btn"
            title="Cerrar sesión"
            @click="logoutSession"
          >
            🗑️
          </button>
          <button
            v-else
            class="cancel-btn"
            title="Cancelar QR"
            @click="cancelQR"
          >
            ✖
          </button>
        </div>
      </div>
  
      <p class="status">
        {{ session.status == 'conectado' ? 'Conectado ✅' : 'Desconectado ❌' }}
      </p>
  
      <div v-if="session.qr && session.status !== 'conectado'" class="qr-container">
        <img :src="session.qr" alt="QR" />
        <p>Escaneá este código con WhatsApp</p>
      </div>
  
      <MessageForm
        v-if="session.status == 'conectado'"
        :sessionId="session.sessionId"
      />
    </div>
  </template>
  
  <script setup>
  import MessageForm from './MessageForm.vue'
  import axios from '../api/axios'
  
  const props = defineProps({ session: Object })
  const emit = defineEmits(['cancel', 'removed'])
  
  // Cancela solo el QR (sin borrar sesión)
  const cancelQR = () => {
    emit('cancel', props.session.sessionId)
  }
  
  // Llama al backend para cerrar sesión y eliminarla completamente
  const logoutSession = async () => {
    if (!confirm(`¿Cerrar y eliminar la sesión "${props.session.sessionId}"?`)) return
    try {
      await axios.delete('/sessions', {
        data: {sessionId: props.session.sessionId}
      })
      emit('removed', props.session.sessionId)
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
      alert('No se pudo cerrar la sesión.')
    }
  }
  </script>
  
  <style>
  .session-card {
    display: flex;
    flex-direction: column;
  }
  
  .session-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .session-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .cancel-btn,
  .logout-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    transition: transform 0.1s;
  }
  
  .cancel-btn:hover {
    color: #dc2626;
    transform: scale(1.1);
  }
  
  .logout-btn:hover {
    color: #2563eb;
    transform: scale(1.1);
  }
  
  .status {
    color: #4b5563;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .qr-container {
    text-align: center;
  }
  
  .qr-container img {
    width: 200px;
    height: 200px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 0.5rem;
  }
  </style>
  