import { renderOutcomeChart } from './js/chartRenderer.js';
// Mock DOM
global.document = {
  getElementById: (id) => {
    return {
      getContext: () => ({
        clearRect: () => {},
        fillText: () => {},
      }),
      width: 300,
      height: 300
    };
  }
};
global.Chart = class {
  constructor() {}
  destroy() {}
};

try {
  renderOutcomeChart({});
  console.log("SUCCESS empty");
} catch(e) {
  console.error("FAIL empty", e);
}

try {
  renderOutcomeChart({a: 1});
  console.log("SUCCESS a: 1");
} catch(e) {
  console.error("FAIL a: 1", e);
}
