/* @flow */
/* eslint no-restricted-globals: ["off"] */
import Simc from './engine/engine';

let engine;

export type MsgLoaded = {
  event: 'loaded',
};

export type MsgProgress = {
  event: 'progressUpdate',
  progress: {
    iteration: number,
    totalIterations: number,
    phase: number,
    totalPhases: number,
    phaseName: string,
    subphaseName: string,
  },
}

export type MsgDone = {
  event: 'done',
  result: Object,
}

export type SimMsg = MsgLoaded | MsgProgress | MsgDone;

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

self.onmessage = (e) => {
  const result = simulate(engine, e.data);
  let parsed = {};
  try {
    parsed = JSON.parse(result);
  } catch (err) {
    console.warn(err);
    console.warn(result);
  }
  self.postMessage({ event: 'done', result: parsed });
};

engine = Simc();
