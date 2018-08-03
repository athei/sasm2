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
import Simcraft from './simcraft';
import type { SimProgress } from './simcraft';

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

const Status = {
  Idle: 1,
  Simulating: 2,
};
type StatusEnum = $Values<typeof Status>;

type Props = {
  classes: Object,
  simc: Simcraft,
};

type State = {
  profile: string,
  result: Object,
  progress: ?SimProgress,
  status: StatusEnum,
};

class Simulator extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      profile: '',
      result: {},
      progress: undefined,
      status: Status.Idle,
    };
  }

  profileHandler = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({ profile: e.currentTarget.value });
  }

  buttonHandler = () => {
    this.setState((prev) => {
      if (prev.status !== Status.Idle) {
        return {};
      }

      const { simc } = this.props;
      simc.addJob(prev.profile, (progress) => {
        this.setState({ progress });
      }).then((result) => {
        this.setState({ status: Status.Idle, result });
      }, (err) => {
        this.setState({ status: Status.Idle });
        console.warn(err);
      });
      return { status: Status.Simulating, result: {}, progress: null };
    });
  }

  buttonText = (): string => {
    const { status } = this.state;
    switch (status) {
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

  renderProgress = (progress: SimProgress) => {
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
