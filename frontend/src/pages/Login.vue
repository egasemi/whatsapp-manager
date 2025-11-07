<template>
    <div class="login-wrapper">
      <form class="card login-form" @submit.prevent="login">
        <h2 class="login-title">Iniciar sesión</h2>
        <input
          class="input"
          type="text"
          v-model="username"
          placeholder="Usuario"
        />
        <input
          class="input"
          type="password"
          v-model="password"
          placeholder="Contraseña"
        />
        <button class="button" type="submit">Entrar</button>
        <p v-if="error" class="error-text">{{ error }}</p>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from "../api/axios"
  
  const username = ref('');
  const password = ref('');
  const error = ref('');
  const router = useRouter();
  
  const login = async () => {
    error.value = ''
    try {
      const res = await axios.post('/auth/login', 
        { 
          username: username.value, 
          password: password.value 
        }
      )

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/dashboard')
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al iniciar sesión'
    }
  };
  </script>
  
  <style>
  .login-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  
  .login-form {
    width: 100%;
    max-width: 360px;
  }
  
  .login-title {
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .error-text {
    color: var(--error);
    text-align: center;
    margin-top: 0.5rem;
  }
  input {
    margin-bottom: 1rem;
  }
  </style>
  