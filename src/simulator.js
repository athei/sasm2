import React from 'react';
import { Enum } from 'enumify';
import Engine from './engine/engine.js';

class State extends Enum {}
State.initEnum([
  'Loading',
  'Idle',
  'Simulating',
]);

const simulate = (sim, profile) => {
  const ptr_in = sim.allocateUTF8(profile);
  const ptr_out = sim._simulate(ptr_in);
  sim._free(ptr_in);
  const result = sim.UTF8ToString(ptr_out);
  sim._free(ptr_out);
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
      self.simc_callbacks = {
        loaded: () => {
          this.engineDidLoad();
        },
        update_progress: (progress) => {
          console.log(progress);
        },
      };

      this.simc = Engine();
    }

    render = () => (
      <div>
        <textarea
          rows="30"
          cols="50"
          placeholder="Paste profile here!"
          onChange={this.profileHandler}
          value={this.state.profile}
        />
        <textarea
          rows="30"
          cols="50"
          placeholder="Output"
          value={this.state.result}
          readOnly
        />
        <button onClick={this.buttonHandler} disabled={!this.buttonEnabled()}>
          {this.buttonText()}
        </button>
      </div>
    )


    engineDidLoad = () => {
      this.setState((prev) => {
        switch (prev.state) {
          case State.Loading:
            return { state: State.Idle };
        }
      });
    }

    profileHandler = (e) => {
      this.setState({ profile: e.target.value });
    }

    buttonHandler = (e) => {
      this.setState((prev) => {
        switch (prev.state) {
          case State.Idle:
            const result = simulate(this.simc, this.state.profile);
            return { state: State.Idle, result };
        }
      });
    }

    buttonText = () => {
      switch (this.state.state) {
        case State.Loading:
          return 'Loading...';
        case State.Idle:
          return 'Start Simulation';
        case State.Simulating:
          return 'Simulating...';
      }
    }

    buttonEnabled = () => {
      switch (this.state.state) {
        case State.Loading:
          return false;
        case State.Idle:
          return true;
        case State.Simulating:
          return false;
      }
    }
}

export default Simulator;
