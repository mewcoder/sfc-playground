<script setup>
import SplitPanel from './components/split-panel.vue';
import Editor from './components/editor/index.vue';
import Output from './components/output/index.vue';
import { provide, toRef } from 'vue';

const props = defineProps({
  store: {
    type: Object,
    default: () => new ReplStore()
  },
  autoResize: {
    type: Boolean,
    default: true
  },
  showCompileOutput: {
    type: Boolean,
    default: true
  },
  showImportMap: {
    type: Boolean,
    default: true
  },
  clearConsole: {
    type: Boolean,
    default: true
  },
  sfcOptions: {
    type: Object,
    default: () => ({})
  },
  layout: {
    type: String,
    default: ''
  },
  ssr: {
    type: Boolean,
    default: false
  }
});

props.store.options = props.sfcOptions;
props.store.init();

provide('store', props.store);
provide('autoresize', props.autoResize);
provide('import-map', toRef(props, 'showImportMap'));
provide('clear-console', toRef(props, 'clearConsole'));
</script>

<template>
  <div class="vue-repl">
    <SplitPanel :layout="layout">
      <template #left>
        <Editor />
      </template>
      <template #right>
        <Output :showCompileOutput="showCompileOutput" :ssr="!!ssr" />
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped>
.vue-repl {
  --bg: #fff;
  --bg-soft: #f8f8f8;
  --border: #ddd;
  --text-light: #888;
  --font-code: Menlo, Monaco, Consolas, 'Courier New', monospace;
  --color-branding: #42b883;
  --color-branding-dark: #416f9c;
  --header-height: 38px;

  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  overflow: hidden;
  background-color: var(--bg-soft);
}

.dark .vue-repl {
  --bg: #1a1a1a;
  --bg-soft: #242424;
  --border: #383838;
  --text-light: #aaa;
  --color-branding: #42d392;
  --color-branding-dark: #89ddff;
}

:deep(button) {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}
</style>
