'use strict';

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

// ### Stores
// Load initial interface reducer stores

import './reducers';

// ### Style

import 'styles/index.scss';

// ### Render
// Application starts its rendering process at this point.

ReactDOM.render(
  <Router history={ createBrowserHistory() } routes={ routes } />,
  document.getElementById('react')
);