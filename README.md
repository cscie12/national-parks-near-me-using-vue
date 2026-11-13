# Parks Near Me

A small **Vue 3 + Vite** single-page app (SPA). It finds the National Park Service (NPS) sites closest to you.

When the page loads, the app downloads the list of NPS sites from the [NPS API](https://www.nps.gov/subjects/developer/index.htm). You then pick a location, either your real one (using the browser's location) or one of the sample cities. The app sorts every park by distance from that spot and shows the closest ones. A slider controls how many it shows.

The code is short on purpose, and it's commented for learning.

---

## What you'll practice here

- **Vue 3 basics** with `<script setup>`: `ref`, `computed`, `onMounted`, props, `v-if` / `v-for`, and `v-model`
- **Fetching data** from a real REST API with `fetch` and `async` / `await`
- **Promises**: wrapping a callback-based browser API in a Promise (`getPosition`), and caching a Promise so a request runs only once (`getAllParks`)
- **Separating concerns**: plain JavaScript "library" files do the work, and Vue components only display results
- **Environment variables and API keys**, and why a key in browser code is *not* secret

---

## Getting started

### 1. Prerequisites

- **Node.js** version 22.18 or later (check with `node -v`)
- A code editor. We recommend [VS Code](https://code.visualstudio.com/) with the [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension.

### 2. Install dependencies

```sh
npm install
```

### 3. Add your NPS API key

```sh
cp .env.example .env
```

Then open `.env` and replace `DEMO_KEY` with your own key. Keys are free from <https://www.nps.gov/subjects/developer/get-started.htm>.

> `DEMO_KEY` works for a quick test, but it's heavily rate-limited. If the app suddenly shows an API error, you've probably hit that limit.
>
> `.env` is listed in `.gitignore`, so it won't be committed. `.env.example` is the template that *is* committed.

### 4. Run the dev server

```sh
npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>). Saved changes appear in the browser right away ("hot reload").

**If you change `.env`, stop the server (Ctrl+C) and start it again.** Vite reads `.env` only at startup.

---

## How the code is organized

```
parks-near-me/
├── index.html                 ← the single HTML page; Vue mounts into <div id="app">
├── .env.example               ← template for your API key (copy to .env)
├── vite.config.js             ← build tool config (you rarely need to touch this)
└── src/
    ├── main.js                ← entry point: creates the Vue app and mounts App.vue
    ├── style.css              ← global styles + color variables (light & dark mode)
    ├── App.vue                ← top-level component: loads parks, shows loading/error
    ├── components/
    │   └── ParksNearMe.vue    ← the UI: location buttons, slider, list of nearest parks
    └── lib/
        ├── nps.js             ← ALL calls to the NPS API live here
        └── geo.js             ← browser geolocation + distance math
```

### Suggested reading order

1. **[src/main.js](src/main.js)**: five lines that start everything.
2. **[src/App.vue](src/App.vue)**: when the page loads (`onMounted`), it calls `getAllParks()`. It shows "Loading…", then either an error or the `ParksNearMe` component.
3. **[src/lib/nps.js](src/lib/nps.js)**: how the API request is built, and how the park list is trimmed down (`slimPark`) and cached (`getAllParks`).
4. **[src/components/ParksNearMe.vue](src/components/ParksNearMe.vue)**: the interactive part. Look at the `nearest` computed property. It recalculates by itself when the location or the slider changes.
5. **[src/lib/geo.js](src/lib/geo.js)**: `getPosition()` turns the browser's callback-style geolocation into a Promise. `distanceMiles()` uses the Haversine formula, which gives the straight-line distance between two points on Earth.

### How data moves through the app

```
NPS API ──fetch──▶ nps.js (getAllParks) ──▶ App.vue (parks ref)
                                                 │  :parks="parks"  (prop)
                                                 ▼
                     geo.js ◀── ParksNearMe.vue ──▶ sorted list on screen
             (your location + distances)
```

`ParksNearMe.vue` **never fetches anything itself**. It's *given* the list of parks as a prop. That keeps it reusable: a different app could get the parks some other way, such as at build time, and use the same component unchanged.

---

## ⚠️ A note about the API key

Vite only lets browser code read environment variables whose names start with `VITE_`. That prefix is a warning: **anything named `VITE_…` is built into the JavaScript sent to every visitor.**

Try this: run the app, open DevTools → **Network**, and click the request to `developer.nps.gov`. Your API key is right there in the URL.

That's acceptable for a free, rate-limited key in a class demo. It's **not** acceptable for a secret key, such as a paid service or anything that can change data. Fixing this means making the API call on a server or at build time instead of in the browser. A later version of this project (`03-astro-nps-vue`) does exactly that.

---

## Commands

| Command           | What it does                                                       |
| ----------------- | ------------------------------------------------------------------ |
| `npm run dev`     | Start the dev server with hot reload                               |
| `npm run build`   | Create an optimized production build in `dist/`                    |
| `npm run preview` | Serve the `dist/` build locally so you can check it before deploying |

---

## Ideas for experimenting

- Add a sample city to `SAMPLE_LOCATIONS` in [src/lib/geo.js](src/lib/geo.js).
- Turn each park name into a link to its NPS page. `slimPark` already keeps `url`.
- Show each park's `designation` (e.g. "National Park" or "National Monument"), or add a filter that shows only one designation.
- Change the slider's maximum from 50 to something else.
- Use `getPark(parkCode)` in `nps.js` to show more detail, such as a description or images, when someone clicks a park.

---

## Helpful tools

- **Vue DevTools** are built into this project through `vite-plugin-vue-devtools`. While `npm run dev` is running, look for the Vue icon at the bottom of the page. You can also install the browser extension for [Chrome/Edge](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/).
- [Vue docs](https://vuejs.org/guide/introduction.html) · [Vite docs](https://vite.dev/guide/) · [NPS API docs](https://www.nps.gov/subjects/developer/api-documentation.htm)

> **Note:** `src/assets/` (`base.css`, `main.css`, `logo.svg`) is left over from the Vue starter template and isn't used. The app's styles are in `src/style.css`.
