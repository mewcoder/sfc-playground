export class ReplStore {
  constructor() {
    this.state = {
      files: [],
      activeFile: {
        code: '',
        filename: ''
      },
      errors: ['']
    };
  }
  serialize() {}
  init() {}
  addFile() {}
  setActive() {}
}

export const File = null;
