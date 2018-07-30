import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import Simulator from './simulator';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
  },
});

function App(props) {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Simulator />
    </div>
  );
}

export default withStyles(styles)(App);
