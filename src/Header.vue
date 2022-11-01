<script setup>
import { downloadProject } from './download';
import Sun from './icons/Sun.vue';
import Moon from './icons/Moon.vue';
import Share from './icons/Share.vue';
import Download from './icons/Download.vue';
import GitHub from './icons/GitHub.vue';

defineProps(['store']);

function toggleDark() {
  const cls = document.documentElement.classList;
  cls.toggle('dark');
  localStorage.setItem('vue-sfc-playground-prefer-dark', String(cls.contains('dark')));
}

async function copyLink() {
  await navigator.clipboard.writeText(location.href);
  alert('Sharable URL has been copied to clipboard.');
}
</script>

<template>
  <nav>
    <h1>
      <span>Vue SFC Playground</span>
    </h1>
    <div class="links">
      <button title="Toggle dark mode" class="toggle-dark" @click="toggleDark">
        <Sun class="light" />
        <Moon class="dark" />
      </button>
      <button title="Copy sharable URL" class="share" @click="copyLink">
        <Share />
      </button>
      <button title="Download project files" class="download" @click="downloadProject(store)">
        <Download />
      </button>
      <button title="View on GitHub" class="github">
        <a href="https://github.com/vuejs/core/tree/main/packages/sfc-playground" target="_blank">
          <GitHub />
        </a>
      </button>
    </div>
  </nav>
</template>

<style>
nav {
  --bg: #fff;
  --bg-light: #fff;
  --border: #ddd;
  --btn: #666;
  --highlight: #333;
  --green: #3ca877;
  --purple: #904cbc;
  --btn-bg: #eee;
  color: var(--base);
  height: var(--nav-height);
  box-sizing: border-box;
  padding: 0 1em;
  background-color: var(--bg);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.33);
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
}
.dark nav {
  --base: #ddd;
  --bg: #1a1a1a;
  --bg-light: #242424;
  --border: #383838;
  --highlight: #fff;
  --btn-bg: #333;
  box-shadow: none;
  border-bottom: 1px solid var(--border);
}
h1 {
  font-weight: 500;
  display: inline-flex;
  place-items: center;
}
h1 img {
  height: 24px;
  margin-right: 10px;
}
@media (max-width: 560px) {
  h1 span {
    font-size: 0.9em;
  }
}
@media (max-width: 520px) {
  h1 span {
    display: none;
  }
}
.links {
  display: flex;
}

.toggle-dev span,
.toggle-ssr span {
  font-size: 12px;
  border-radius: 4px;
  padding: 4px 6px;
}
.toggle-dev span {
  background: var(--purple);
  color: #fff;
}
.toggle-dev.dev span {
  background: var(--green);
}
.toggle-ssr span {
  background-color: var(--btn-bg);
}
.toggle-ssr.enabled span {
  color: #fff;
  background-color: var(--green);
}
.toggle-dark svg {
  width: 18px;
  height: 18px;
}
.toggle-dark .dark,
.dark .toggle-dark .light {
  display: none;
}
.dark .toggle-dark .dark {
  display: inline-block;
}
.links button,
.links button a {
  color: var(--btn);
}
.links button:hover,
.links button:hover a {
  color: var(--highlight);
}

.links > * {
  display: flex;
  align-items: center;
}
.links > * + * {
  margin-left: 4px;
}
</style>
