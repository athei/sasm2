import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Enum } from 'enumify';

class State extends Enum {}
State.initEnum([
  'Loading',
  'Idle',
  'Simulating',
]);

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
    this.simWorker = new Worker('sim_worker.js');
    this.simWorker.onmessage = (e) => {
      this.workerMessage(e);
    };
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

  engineSimDone = (result) => {
    this.setState((prev) => {
      switch (prev.state) {
        case State.Simulating:
          return { state: State.Idle, result };
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
          this.simWorker.postMessage(prev.profile);
          return { state: State.Simulating, result: '' };
        }
        default:
          return {};
      }
    });
  }

  workerMessage = (e) => {
    const { event, result, progress } = e.data;
    switch (event) {
      case 'loaded':
        this.engineDidLoad();
        break;
      case 'done':
        this.engineSimDone(result);
        break;
      case 'progressUpdate':
        console.log(progress.iteration);
        break;
      default:
        break;
    }
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
        <TextField
          rows="20"
          multiline
          placeholder="Paste profile here!"
          onChange={this.profileHandler}
          value={profile}
        />
        <TextField
          rows="20"
          multiline
          placeholder="Output"
          value={result}
          readOnly
        />
        <Button color="primary" variant="contained" onClick={this.buttonHandler} disabled={!this.buttonEnabled()}>
          {this.buttonText()}
        </Button>
      </div>
    );
  }
}

export default Simulator;
