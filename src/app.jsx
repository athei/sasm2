import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
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

App.propTypes = {
  classes: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default withStyles(styles)(App);
