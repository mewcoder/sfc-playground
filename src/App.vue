<script setup>
import Header from './components/Header.vue';
import { Repl, ReplStore } from '@vue/repl';

const store = new ReplStore({
  serializedState: location.hash.slice(1),
  defaultVueRuntimeURL: import.meta.env.PROD ? undefined : `${location.origin}/src/vue-dev-proxy`
});

const sfcOptions = {
  script: {
    reactivityTransform: true
  }
};
</script>

<template>
  <Header :store="store" />
  <Repl
    @keydown.ctrl.s.prevent
    @keydown.meta.s.prevent
    :store="store"
    :show-compile-output="true"
    :auto-resize="true"
    :sfc-options="sfcOptions"
    :clear-console="false"
  />
</template>

<style>
.dark {
  color-scheme: dark;
}
body {
  font-size: 13px;
  margin: 0;
  --base: #444;
  --nav-height: 50px;
}

button {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}

.vue-repl {
  height: calc(var(--vh) - var(--nav-height));
}
</style>
