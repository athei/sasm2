/* eslint no-restricted-globals: ["off"] */

import React from 'react';
import { Enum } from 'enumify';
import Engine from './engine/engine';

class State extends Enum {}
State.initEnum([
  'Loading',
  'Idle',
  'Simulating',
]);

const simulate = (sim, profile) => {
  const ptrIn = sim.allocateUTF8(profile);
  const ptrOut = sim._simulate(ptrIn);
  sim._free(ptrIn);
  const result = sim.UTF8ToString(ptrOut);
  sim._free(ptrOut);
  return result;
};

class Simulator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profile: '',
      result: '',
      state: State.Loading,
    };
  }

  componentDidMount = () => {
    self.simcCallbacks = {
      loaded: () => {
        this.engineDidLoad();
      },
      updateProgress: (progress) => {
        console.log(progress);
      },
    };

    this.simc = Engine();
  }

  engineDidLoad = () => {
    this.setState((prev) => {
      switch (prev.state) {
        case State.Loading:
          return { state: State.Idle };
        default:
          return {};
      }
    });
  }

  profileHandler = (e) => {
    this.setState({ profile: e.target.value });
  }

  buttonHandler = () => {
    this.setState((prev) => {
      switch (prev.state) {
        case State.Idle: {
          const result = simulate(this.simc, prev.profile);
          return { state: State.Idle, result };
        }
        default:
          return {};
      }
    });
  }

  buttonText = () => {
    const { state } = this.state;
    switch (state) {
      case State.Loading:
        return 'Loading...';
      case State.Idle:
        return 'Start Simulation';
      case State.Simulating:
        return 'Simulating...';
      default:
        return 'UNHANDLED';
    }
  }

  buttonEnabled = () => {
    const { state } = this.state;
    switch (state) {
      case State.Loading:
        return false;
      case State.Idle:
        return true;
      case State.Simulating:
        return false;
      default:
        return false;
    }
  }

  render = () => {
    const { profile, result } = this.state;
    return (
      <div>
        <textarea
          rows="30"
          cols="50"
          placeholder="Paste profile here!"
          onChange={this.profileHandler}
          value={profile}
        />
        <textarea
          rows="30"
          cols="50"
          placeholder="Output"
          value={result}
          readOnly
        />
        <button type="button" onClick={this.buttonHandler} disabled={!this.buttonEnabled()}>
          {this.buttonText()}
        </button>
      </div>
    );
  }
}

export default Simulator;
