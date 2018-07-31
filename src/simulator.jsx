/* @flow */
import React from 'react';
import Inspector from 'react-inspector';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles } from '@material-ui/core/styles';
import { Enum } from 'enumify';
import type { SimMsg, Progress } from './sim_worker';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 3,
  },
  area: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing.unit * 1,
  },
  progressText: {
    textAlign: 'right',
    marginTop: theme.spacing.unit * 1,
  },
});

class Status extends Enum {}
Status.initEnum([
  'Unloaded',
  'Loading',
  'Idle',
  'Simulating',
]);

type Props = {
  classes: Object
};

type State = {
  profile: string,
  result: Object,
  progress: ?Progress,
  status: Status,
};

class Simulator extends React.Component<Props, State> {
  simWorker: Worker;

  constructor(props) {
    super(props);

    this.state = {
      profile: '',
      result: {},
      progress: undefined,
      status: Status.Unloaded,
    };
  }

  engineDidLoad = () => {
    this.setState((prev) => {
      switch (prev.status) {
        case Status.Loading:
          return { status: Status.Idle };
        default:
          return {};
      }
    });
  }

  engineSimDone = (result: Object) => {
    this.setState((prev) => {
      switch (prev.status) {
        case Status.Simulating:
          return { status: Status.Idle, result };
        default:
          return {};
      }
    });
  }

  profileHandler = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({ profile: e.currentTarget.value });
  }

  buttonHandler = () => {
    this.setState((prev) => {
      switch (prev.status) {
        case Status.Unloaded:
          this.simWorker = new Worker('sim_worker.js');
          this.simWorker.onmessage = (e: MessageEvent) => {
            this.workerMessage((e.data: any));
          };
          return { status: Status.Loading };
        case Status.Idle: {
          this.simWorker.postMessage(prev.profile);
          return { status: Status.Simulating, result: {}, progress: undefined };
        }
        default:
          return {};
      }
    });
  }

  workerMessage = (data: SimMsg) => {
    if (data.event === 'loaded') {
      this.engineDidLoad();
    } else if (data.event === 'done') {
      this.engineSimDone(data.result);
    } else if (data.event === 'progressUpdate') {
      this.setState({ progress: data.progress });
    }
  }

  buttonText = (): string => {
    const { status } = this.state;
    switch (status) {
      case Status.Unloaded:
        return 'Load Engine';
      case Status.Loading:
        return 'Loading...';
      case Status.Idle:
        return 'Start Simulation';
      case Status.Simulating:
        return 'Simulating...';
      default:
        return 'UNHANDLED';
    }
  }

  buttonEnabled = (): boolean => {
    const { status } = this.state;
    switch (status) {
      case Status.Unloaded:
        return true;
      case Status.Loading:
        return false;
      case Status.Idle:
        return true;
      case Status.Simulating:
        return false;
      default:
        return false;
    }
  }

  renderResult = () => {
    const { classes } = this.props;
    const { result } = this.state;

    return (
      <Paper className={classes.paper}>
        <Typography variant="display1" gutterBottom>
          Result
        </Typography>
        <Inspector name="Simulation" data={result} expandPaths={['$', '$.sim', '$.sim.statistics']} />
      </Paper>
    );
  }

  renderProgress = (progress: Progress) => {
    const { classes } = this.props;
    let value = 0;
    let phaseText = progress.phaseName || 'Generating';

    if (progress.subphaseName) {
      phaseText += ` - ${progress.subphaseName} `;
    }

    phaseText += ` (${progress.phase}/${progress.totalPhases}): `;

    if (progress.iteration) {
      value = (progress.iteration * 100) / progress.totalIterations;
    }

    return (
      <Paper className={classes.paper}>
        <Typography variant="display1" gutterBottom>
          Progress
        </Typography>
        <LinearProgress variant="determinate" value={value} />
        <Typography variant="subheading" className={classes.progressText}>
          {phaseText}
          {progress.iteration}
          /
          {progress.totalIterations}
        </Typography>
      </Paper>
    );
  }

  render = () => {
    const { classes } = this.props;
    const {
      profile,
      result,
      status,
      progress,
    } = this.state;
    let output;

    if (status === Status.Idle && 'sim' in result) {
      output = this.renderResult();
    } else if (progress && status === Status.Simulating && 'iteration' in progress) {
      output = this.renderProgress(progress);
    }

    return (
      <Grid container spacing={32}>
        <Grid item xs={12}>
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
        <Grid item xs={12}>
          {output}
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Simulator);
