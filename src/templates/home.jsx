'use strict';

import React                from 'react';
import Reach, { relay }     from 'reach-react';
import UI                   from 'reach-ui';
import { templates, views } from 'reach-ui';
import policies             from 'policies';
import Header               from 'views/app/header';
import 'styles/home/style.scss';

/**
 * @class AppTemplate
 */
class HomeTemplate extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'home');
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'home');
  }

  /**
   * @method render
   */
  render() {
    return (
      <div id="home">
        <Header />
        <div id="content">
          <div id="content-wrapper">
            { this.props.children }
          </div>
        </div>
      </div>
    );
  }
}

// ### Register Template
templates.register('home', {
  component : HomeTemplate,
  getChildRoutes(state, done) {
    done(null,
      [
        {
          path      : '/',
          component : require('views/home/home')
        }
      ].concat(views.getRoutes('home'))
    );
  }
});