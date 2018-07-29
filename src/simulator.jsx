import React from 'react';
import Inspector from 'react-inspector';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { Enum } from 'enumify';

const styles = theme => ({
  root: {
    margin: theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit * 4,
    marginRight: theme.spacing.unit * 4,
  },
  item: {
    margin: 'auto',
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  paper: {
    padding: theme.spacing.unit * 3,
  },
  area: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing.unit * 1,
  },
});

class State extends Enum {}
State.initEnum([
  'Unloaded',
  'Loading',
  'Idle',
  'Simulating',
]);

class Simulator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profile: '',
      result: {},
      state: State.Unloaded,
    };
  }

  componentDidMount = () => {

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
        case State.Unloaded:
          this.simWorker = new Worker('sim_worker.js');
          this.simWorker.onmessage = (e) => {
            this.workerMessage(e);
          };
          return { state: State.Loading };
        case State.Idle: {
          this.simWorker.postMessage(prev.profile);
          return { state: State.Simulating, result: {} };
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
      case State.Unloaded:
        return 'Load Engine';
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
      case State.Unloaded:
        return true;
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

  renderResult = () => {
    const { classes } = this.props;
    const { result } = this.state;
    return (
      <Grid item xs={12} className={classes.item}>
        <Paper className={classes.paper}>
          <Typography variant="display1" gutterBottom>
            Result
          </Typography>
          <Inspector name="Simulation" data={result} expandPaths={['$', '$.sim', '$.sim.statistics']} />
        </Paper>
      </Grid>
    );
  }

  render = () => {
    const { classes } = this.props;
    const { profile, result, state } = this.state;
    return (
      <div className={classes.root}>
        <Grid container>
          <Grid item xs={12} className={classes.item}>
            <Paper className={classes.paper}>
              <TextField
                rows="15"
                className={classes.area}
                multiline
                placeholder="Paste profile here!"
                onChange={this.profileHandler}
                value={profile}
              />
              <Button className={classes.button} color="primary" variant="contained" onClick={this.buttonHandler} disabled={!this.buttonEnabled()}>
                {this.buttonText()}
              </Button>
            </Paper>
          </Grid>
        </Grid>
        <Grid container>
          {state === State.Idle && 'sim' in result
            && this.renderResult()
          }
        </Grid>
      </div>
    );
  }
}

Simulator.propTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles)(Simulator);
