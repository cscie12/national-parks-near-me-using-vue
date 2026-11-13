<script setup>
import { ref, computed } from 'vue'
import { getPosition, distanceMiles, SAMPLE_LOCATIONS } from '../lib/geo.js'

// This component does NOT fetch parks itself. It is handed a list.
// That makes it reusable: the Vue SPA fetches the list in the browser;
// If we then take this to Astro site it is fetched at build time and passed it in as a prop.
const props = defineProps({
  parks: { type: Array, required: true }, // [{ parkCode, fullName, states, latitude, longitude }]
})

// --- state ---
const here = ref(null) // { name, latitude, longitude }
const locating = ref(false)
const error = ref('')
const count = ref(10)

// --- derived state: recomputes when parks, here, or count change ---
const nearest = computed(() => {
  if (!here.value) return []
  return props.parks
    .map((park) => ({ ...park, distance: distanceMiles(here.value, park) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count.value)
})

// --- actions ---
async function useMyLocation() {
  locating.value = true
  error.value = ''
  try {
    const pos = await getPosition()
    here.value = { name: 'your location', ...pos }
  } catch (err) {
    error.value = err.message || 'Could not get your location.'
  } finally {
    locating.value = false
  }
}

function useSample(place) {
  error.value = ''
  here.value = place
}
</script>

<template>
  <div class="parks-near-me">
    <div class="controls">
      <button @click="useMyLocation" :disabled="locating">
        {{ locating ? 'Locating…' : '📍 Use my location' }}
      </button>
      <span class="or">or try:</span>
      <button
        v-for="place in SAMPLE_LOCATIONS"
        :key="place.name"
        class="secondary"
        @click="useSample(place)"
      >{{ place.name }}</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="here">
      <label class="count">
        Show {{ count }} closest parks to {{ here.name }}
        <input type="range" min="1" max="50" v-model.number="count" />
      </label>

      <ol class="park-list">
        <li v-for="park in nearest" :key="park.parkCode">
          {{ park.fullName }}
          <span class="meta">{{ park.states }} · {{ Math.round(park.distance) }} mi</span>
        </li>
      </ol>
    </template>

    <p v-else-if="!locating" class="hint">Choose a location to find the closest parks.</p>
  </div>
</template>

<style scoped>
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.or { color: var(--muted); }
.error { color: var(--error); }
.hint { color: var(--muted); }
.count { display: block; margin: 1rem 0 0.5rem; font-weight: 600; }
.count input { display: block; width: 100%; max-width: 20rem; }
.park-list { padding-left: 1.5rem; }
.park-list li { margin: 0.4rem 0; }
.meta { color: var(--muted); margin-left: 0.5rem; font-size: 0.9em; }
</style>
