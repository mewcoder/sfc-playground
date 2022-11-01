import { version, reactive, watchEffect } from 'vue';
import * as defaultCompiler from 'vue/compiler-sfc';
import { compileFile } from './transform';
import { utoa, atou } from './utils';

const defaultMainFile = 'App.vue';

const welcomeCode = `
<script setup>
import { ref } from 'vue'

const msg = ref('Hello World!')
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg">
</template>
`.trim();

export class File {
  filename;
  code;
  hidden;
  compiled = {
    js: '',
    css: '',
    ssr: ''
  };

  constructor(filename, code = '', hidden = false) {
    this.filename = filename;
    this.code = code;
    this.hidden = hidden;
  }
}

export class ReplStore {
  state;
  compiler = defaultCompiler;
  vueVersion;
  option;
  initialShowOutput;
  initialOutputMode;

  defaultVueRuntimeURL;
  defaultVueServerRendererURL;
  pendingCompiler;

  constructor({
    serializedState = '',
    defaultVueRuntimeURL = `https://unpkg.com/@vue/runtime-dom@${version}/dist/runtime-dom.esm-browser.js`,
    defaultVueServerRendererURL = `https://unpkg.com/@vue/server-renderer@${version}/dist/server-renderer.esm-browser.js`,
    showOutput = false,
    outputMode = 'preview'
  } = {}) {
    let files = {};

    if (serializedState) {
      const saved = JSON.parse(atou(serializedState));
      for (const filename in saved) {
        files[filename] = new File(filename, saved[filename]);
      }
    } else {
      files = {
        [defaultMainFile]: new File(defaultMainFile, welcomeCode)
      };
    }

    this.defaultVueRuntimeURL = defaultVueRuntimeURL;
    this.defaultVueServerRendererURL = defaultVueServerRendererURL;
    this.initialShowOutput = showOutput;
    this.initialOutputMode = outputMode;

    let mainFile = defaultMainFile;
    if (!files[mainFile]) {
      mainFile = Object.keys(files)[0];
    }
    this.state = reactive({
      mainFile,
      files,
      activeFile: files[mainFile],
      errors: [],
      vueRuntimeURL: this.defaultVueRuntimeURL,
      vueServerRendererURL: this.defaultVueServerRendererURL,
      resetFlip: true
    });

    this.initImportMap();
  }

  // don't start compiling until the options are set
  init() {
    watchEffect(() => compileFile(this, this.state.activeFile));
    for (const file in this.state.files) {
      if (file !== defaultMainFile) {
        compileFile(this, this.state.files[file]);
      }
    }
  }

  setActive(filename) {
    this.state.activeFile = this.state.files[filename];
  }

  addFile(fileOrFilename) {
    const file = typeof fileOrFilename === 'string' ? new File(fileOrFilename) : fileOrFilename;
    this.state.files[file.filename] = file;
    if (!file.hidden) this.setActive(file.filename);
  }

  deleteFile(filename) {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      if (this.state.activeFile.filename === filename) {
        this.state.activeFile = this.state.files[this.state.mainFile];
      }
      delete this.state.files[filename];
    }
  }

  serialize() {
    return '#' + utoa(JSON.stringify(this.getFiles()));
  }

  getFiles() {
    const exported = {};
    for (const filename in this.state.files) {
      exported[filename] = this.state.files[filename].code;
    }
    return exported;
  }

  async setFiles(newFiles, mainFile = defaultMainFile) {
    const files = {};
    if (mainFile === defaultMainFile && !newFiles[mainFile]) {
      files[mainFile] = new File(mainFile, welcomeCode);
    }
    for (const filename in newFiles) {
      files[filename] = new File(filename, newFiles[filename]);
    }
    for (const file in files) {
      await compileFile(this, files[file]);
    }
    this.state.mainFile = mainFile;
    this.state.files = files;
    this.initImportMap();
    this.setActive(mainFile);
    this.forceSandboxReset();
  }

  forceSandboxReset() {
    this.state.resetFlip = !this.state.resetFlip;
  }

  initImportMap() {
    const map = this.state.files['import-map.json'];
    if (!map) {
      this.state.files['import-map.json'] = new File(
        'import-map.json',
        JSON.stringify(
          {
            imports: {
              vue: this.defaultVueRuntimeURL
            }
          },
          null,
          2
        )
      );
    } else {
      try {
        const json = JSON.parse(map.code);
        if (!json.imports.vue) {
          json.imports.vue = this.defaultVueRuntimeURL;
          map.code = JSON.stringify(json, null, 2);
        }
        if (!json.imports['vue/server-renderer']) {
          json.imports['vue/server-renderer'] = this.defaultVueServerRendererURL;
          map.code = JSON.stringify(json, null, 2);
        }
      } catch (e) {}
    }
  }

  getImportMap() {
    try {
      return JSON.parse(this.state.files['import-map.json'].code);
    } catch (e) {
      this.state.errors = [`Syntax error in import-map.json: ${e.message}`];
      return {};
    }
  }

  setImportMap(map) {
    this.state.files['import-map.json'].code = JSON.stringify(map, null, 2);
  }

  async setVueVersion(version) {
    this.vueVersion = version;
    const compilerUrl = `https://unpkg.com/@vue/compiler-sfc@${version}/dist/compiler-sfc.esm-browser.js`;
    const runtimeUrl = `https://unpkg.com/@vue/runtime-dom@${version}/dist/runtime-dom.esm-browser.js`;
    const ssrUrl = `https://unpkg.com/@vue/server-renderer@${version}/dist/server-renderer.esm-browser.js`;
    this.pendingCompiler = import(/* @vite-ignore */ compilerUrl);
    this.compiler = await this.pendingCompiler;
    this.pendingCompiler = null;
    this.state.vueRuntimeURL = runtimeUrl;
    this.state.vueServerRendererURL = ssrUrl;
    const importMap = this.getImportMap();
    const imports = importMap.imports || (importMap.imports = {});
    imports.vue = runtimeUrl;
    imports['vue/server-renderer'] = ssrUrl;
    this.setImportMap(importMap);
    this.forceSandboxReset();
    console.info(`[@vue/repl] Now using Vue version: ${version}`);
  }

  resetVueVersion() {
    this.vueVersion = undefined;
    this.compiler = defaultCompiler;
    this.state.vueRuntimeURL = this.defaultVueRuntimeURL;
    this.state.vueServerRendererURL = this.defaultVueServerRendererURL;
    const importMap = this.getImportMap();
    const imports = importMap.imports || (importMap.imports = {});
    imports.vue = this.defaultVueRuntimeURL;
    imports['vue/server-renderer'] = this.defaultVueServerRendererURL;
    this.setImportMap(importMap);
    this.forceSandboxReset();
    console.info(`[@vue/repl] Now using default Vue version`);
  }
}
