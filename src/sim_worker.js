/* eslint no-restricted-globals: ["off"] */
import Simc from './engine/engine';

let engine;

self.simcCallbacks = {
  loaded: () => {
    postMessage({ event: 'loaded' });
  },
  updateProgress: (progress) => {
    postMessage({ event: 'progressUpdate', progress });
  },
};

const simulate = (sim, profile) => {
  const ptrIn = sim.allocateUTF8(profile);
  const ptrOut = sim._simulate(ptrIn);
  sim._free(ptrIn);
  const result = sim.UTF8ToString(ptrOut);
  sim._free(ptrOut);
  return result;
};

onmessage = (e) => {
  const result = simulate(engine, e.data);
  postMessage({ event: 'done', result });
};

engine = Simc();