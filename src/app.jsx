/* @flow */
import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import Simulator from './simulator';
import Simcraft from './simcraft';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
  },
});

type Props = {
  classes: Object
};

class App extends React.Component<Props> {
  simc: Simcraft;

  constructor(props) {
    super(props);

    this.simc = new Simcraft();
  }

  render = () => {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <CssBaseline />
        <div className={classes.root}>
          <Simulator simc={this.simc} />
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(App);
