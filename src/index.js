// ### Polyfill
// Import babel-core polyfill for access to the entire ES6 suite of features.

import 'babel-core/polyfill';

// ### React
// Load in react for the react-router and initial required react features.

import React    from 'react';
import ReactDOM from 'react-dom';

// ### Router
// Current implementation uses react-router for routing react applications.

import Router               from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import routes               from './routes';
import ToolboxApp           from 'react-toolbox/lib/app';

// ### Reducers
// Loads in all non dynamic reducers defined in the ./reducers directory.

let reducers = require.context('./reducers', true, /\.js$/);
console.log(reducers);
reducers.keys().forEach((key) => {
  reducers(key);
});

// ### Style

import 'react-toolbox/lib/commons';
import 'styles/index.scss';

// ### Render
// Application starts its rendering process at this point.

ReactDOM.render(
  <ToolboxApp>
    <Router history={ createBrowserHistory() } routes={ routes } />
  </ToolboxApp>,
  document.getElementById('react')
);
