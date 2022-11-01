<script setup lang="ts">
import Preview from './preview.vue';
import CodeMirror from '../codemirror/index.vue';
import { inject, ref, computed } from 'vue';

const props = defineProps(['showCompileOutput', 'ssr']);

const store = inject('store');
const modes = computed(() =>
  props.showCompileOutput ? ['preview', 'js', 'css', 'ssr'] : ['preview']
);

const mode = ref(
  modes.value.includes(store.initialOutputMode) ? store.initialOutputMode : 'preview'
);
</script>

<template>
  <div class="tab-buttons">
    <button v-for="m of modes" :class="{ active: mode === m }" @click="mode = m">
      <span>{{ m }}</span>
    </button>
  </div>

  <div class="output-container">
    <Preview :show="mode === 'preview'" :ssr="ssr" />
    <CodeMirror
      v-if="mode !== 'preview'"
      readonly
      :mode="mode === 'css' ? 'css' : 'javascript'"
      :value="store.state.activeFile.compiled[mode]"
    />
  </div>
</template>

<style scoped>
.output-container {
  height: calc(100% - var(--header-height));
  overflow: hidden;
  position: relative;
}

.tab-buttons {
  box-sizing: border-box;
  border-bottom: 1px solid var(--border);
  background-color: var(--bg);
  height: var(--header-height);
  overflow: hidden;
}
.tab-buttons button {
  padding: 0;
  box-sizing: border-box;
}
.tab-buttons span {
  font-size: 13px;
  font-family: var(--font-code);
  text-transform: uppercase;
  color: var(--text-light);
  display: inline-block;
  padding: 8px 16px 6px;
  line-height: 20px;
}
button.active {
  color: var(--color-branding-dark);
  border-bottom: 3px solid var(--color-branding-dark);
}
</style>
