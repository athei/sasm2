/* @flow */
import type { SimMsg, Progress } from './sim_worker';

// re-export type for easier access
export type SimProgress = Progress;

const Status = {
  Unloaded: 0,
  Loading: 1,
  Idle: 2,
  Simulating: 3,
};
type StatusEnum = $Values<typeof Status>;

type ProgressFn = (progress: SimProgress) => void;

type SimJob = {
  profile: string,
  progressCallback: ?ProgressFn,
  resolve: (result: Object) => void,
  reject: (err: string) => void,
};

type SimWorker = {
  worker: Worker,
  status: StatusEnum,
  currentJob: ?SimJob,
};


export default class Simcraft {
  workers: Array<SimWorker>;
  pendingJobs: Array<SimJob>;

  constructor() {
    this.pendingJobs = [];
    this.workers = Array.from({ length: navigator.hardwareConcurrency || 4 }, () => ({
      worker: new Worker('sim_worker.js'),
      status: Status.Loading,
      progressCallback: null,
      currentJob: null,
    }));
    console.log(navigator.hardwareConcurrency);
    console.log(this.workers.length);
    this.workers.forEach((w) => {
      w.worker.onmessage = (e: MessageEvent) => {
        w.status = this.onWorkerMessage((e.data: any), w);
      };
    });
  }

  onWorkerMessage = (data: SimMsg, worker: SimWorker): StatusEnum => {
    if (data.event === 'loaded') {
      return this.scheduleWorker(worker);
    }

    if (data.event === 'done') {
      if (!worker.currentJob) {
        console.error('Invalid state transition.');
        return Status.Idle;
      }
      worker.currentJob.resolve(data.result);
      worker.currentJob = null;
      return this.scheduleWorker(worker);
    }

    if (data.event === 'failed') {
      if (!worker.currentJob) {
        console.error('Invalid state transition.');
        return Status.Idle;
      }
      worker.currentJob.reject(data.error);
      worker.currentJob = null;
      return this.scheduleWorker(worker);
    }

    if (data.event === 'progressUpdate') {
      if (worker.currentJob && worker.currentJob.progressCallback) {
        worker.currentJob.progressCallback(data.progress);
      }
      return Status.Simulating;
    }

    console.error('Unvalid message from sim_worker.');
    return Status.Unloaded;
  }

  scheduleWorker = (worker: SimWorker): StatusEnum => {
    const job = this.pendingJobs.shift();

    if (job) {
      this.sendJobToWorker(worker, job);
      return Status.Simulating;
    }
    return Status.Idle;
  }

  scheduleJob = (): void => {
    const freeWorker = this.workers.filter(w => w.status === Status.Idle)[0];
    if (!freeWorker) {
      return;
    }

    const job = this.pendingJobs.shift();
    if (!job) {
      return;
    }

    this.sendJobToWorker(freeWorker, job);
  };

  sendJobToWorker = (worker: SimWorker, job: SimJob): void => {
    worker.currentJob = job;
    worker.worker.postMessage(job.profile);
  };

  addJob = (profile: string, progressCallback: ?ProgressFn): Promise<Object> => {
    const promise = new Promise((resolve, reject) => {
      this.pendingJobs.push({
        profile,
        progressCallback,
        resolve,
        reject,
      });
    });

    this.scheduleJob();
    return promise;
  }
}
