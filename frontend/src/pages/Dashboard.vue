<template>
    <div class="dashboard">
      <div class="top-bar">
        <span>👋 {{ user.username }}</span>
        <button class="logout button" @click="logout">Cerrar sesión</button>
      </div>

      <main class="container">
        <h1>Panel de WhatsApp</h1>
    
        <div class="create-session">
          <input
            v-model="newSession"
            placeholder="Nombre de sesión"
            class="input"
          />
          <button @click="createSession" class="button">Crear sesión</button>
        </div>
    
        <!-- Mensaje si no hay sesiones -->
        <div class="sessions-grid" v-if="sessions.length">
          <SessionCard
            v-for="session in sessions"
            :key="session.sessionId"
            :session="session"
            @cancel="removeQR"
            @removed="removeSession"
          />
        </div>
        <p v-else class="no-sessions">
          No hay sesiones aún. Crea una para comenzar.
        </p>
      </main>
    </div>
</template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { io } from 'socket.io-client';
  import axios from '../api/axios';
  import SessionCard from '../components/SessionCard.vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const sessions = ref([]);
  const newSession = ref('');
  const loading = ref(true);
  const socket = io('http://localhost:4000',{withCredentials: true});
  
  socket.on('qr', ({ sessionId, qr }) => {
    const s = sessions.value.find((x) => x.sessionId === sessionId);
    if (s) s.qr = qr;
    else sessions.value.push({ sessionId, qr, status: 'Esperando QR' });
  });
  
  socket.on('status', ({ sessionId, message }) => {
    const s = sessions.value.find((x) => x.sessionId === sessionId);
    if (s) s.status = message;
    console.log(s)
  });
  
  // 🔹 Obtener sesiones desde el backend
  const loadSessions = async () => {
    try {
      const { data } = await axios.get('/sessions');
      sessions.value = data;
    } catch (err) {
      console.error('Error cargando sesiones', err);
    } finally {
      loading.value = false;
    }
  };
  
  // Crear una nueva sesión
  const createSession = async () => {
    if (!newSession.value.trim()) return;
    await axios.post('/sessions', { sessionId: newSession.value.trim() });
    newSession.value = '';
    //await loadSessions(); // refresca lista
  };
  
  // Cancelar QR
  const removeQR = (sessionId) => {
    const s = sessions.value.find((x) => x.sessionId === sessionId);
    if (s) {
      s.qr = null;
      s.status = 'QR cancelado';
    }
  };
  
  // Cerrar sesión global
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const removeSession = (sessionId) => {
    sessions.value = sessions.value.filter(s => s.sessionId !== sessionId);
  };
  
  // 🔸 Cargar al entrar
  onMounted(() => {
    loadSessions();
  });
  </script>
  
  <style scoped>
  .dashboard {
    min-height: 100vh;
    background-color: #f8f9fb;
    display: flex;
    flex-direction: column;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    padding: 0.8rem 1.5rem;
  }

  .logout {
    background: #ef4444;
    color: #fff;
    border: none;
    padding: 0.4rem, 0.9rem;
    border-radius: 6px;
    cursor:pointer;
    transition: 0.2s;
  }

  .logout:hover {
    background: #dc2626;
  }

  .container {
    flex: 1;
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
  }

  .container h1 {
    font-size: 1.8rem;
    color: #111827;
    margin-bottom: 1.5rem;
  }

  .create-session {
    display: flex;
    gap: 1rem;
    width: 100%;
    max-width: 500px;
    margin-bottom: 2rem;
  }

  .create-session input {
    width: auto;
    flex: 1;
    padding: 0.6rem, 0.8rem;
    border: 1px, solid, #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
  }

  .create-session input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }

  .sessions-grid {
    display: flex;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    max-width: 1000px;
  }

  .no-sessions {
    margin-top: 1.5rem;
    color: #6b7280;
    font-style: italic;
  }
  </style>
  