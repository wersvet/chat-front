<template>
  <div>
    <header class="navbar">
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link v-if="isAuthenticated" to="/profile">Profile</router-link>
        <router-link v-if="isAuthenticated" to="/friends">Friends</router-link>
        <router-link v-if="isAuthenticated" to="/chat">Private Chat</router-link>
        <router-link v-if="isAuthenticated" to="/groups">Group Chat</router-link>
      </div>
      <div class="nav-links">
        <span v-if="isAuthenticated">Hi, {{ auth.user?.username }}</span>
        <router-link v-if="!isAuthenticated" to="/login">Login</router-link>
        <router-link v-if="!isAuthenticated" to="/register">Register</router-link>
        <button v-if="isAuthenticated" @click="logout">Logout</button>
      </div>
    </header>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from './stores/auth.js';

const auth = useAuthStore();
const isAuthenticated = computed(() => auth.isAuthenticated);

const logout = () => {
  auth.logout();
};
</script>