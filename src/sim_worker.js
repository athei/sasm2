/* @flow */
/* eslint no-restricted-globals: ["off"] */
import Simc from './engine/engine';

let engine;

self.simcCallbacks = {
  loaded: () => {
    self.postMessage({ event: 'loaded' });
  },
  updateProgress: (progress) => {
    self.postMessage({ event: 'progressUpdate', progress });
  },
};

const simulate = (sim: Object, profile: string): string => {
  const ptrIn = sim.allocateUTF8(profile);
  const ptrOut = sim._simulate(ptrIn);
  sim._free(ptrIn);
  const result = sim.UTF8ToString(ptrOut);
  sim._free(ptrOut);
  return result;
};

onmessage = (e) => {
  const result = simulate(engine, e.data);
  let parsed = {};
  try {
    parsed = JSON.parse(result);
  } catch (err) {
    console.warn(err);
  }
  self.postMessage({ event: 'done', result: parsed });
};

engine = Simc();
