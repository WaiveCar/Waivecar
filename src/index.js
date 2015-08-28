'use strict';

import 'babel-core/polyfill';
import React        from 'react';
import ReactDOM     from 'react-dom';
import { Provider } from 'react-redux';
import Router       from 'react-router';
import { history }  from 'react-router/lib/HashHistory';
import routes       from './routes';
import store        from './store';

ReactDOM.render(
  <Provider store={ store }>
    {
      function() {
        return <Router history={ history } routes={ routes } />
      }
    }
  </Provider>,
  document.getElementById('react')
);