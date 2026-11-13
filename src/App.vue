<script setup>
import { ref, onMounted } from 'vue'
import ParksNearMe from './components/ParksNearMe.vue'
import { getAllParks } from './lib/nps.js'

// ParksNearMe needs a list of parks handed to it (the `parks` prop).
// In this SPA, the parent (App) fetches that list in the browser.
const parks = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    parks.value = await getAllParks()
  } catch (err) {
    error.value = err.message || 'Could not load parks.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <header class="site-header">
    <span class="brand">National Parks</span>
  </header>

  <main class="container">
    <p v-if="loading">Loading parks…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <ParksNearMe v-else :parks="parks" />
  </main>
</template>

<style scoped>
.error { color: var(--error); }
</style>
