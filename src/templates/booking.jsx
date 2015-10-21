'use strict';

import React     from 'react';
import UI        from 'reach-ui';
import { relay } from 'reach-react';
import 'styles/booking/style.scss';

class BookingTemplate extends React.Component {
  render() {
    return (
      <div id="booking">
        { this.props.children }
      </div>
    );
  }
}

// ### Register Template

UI.templates.register('booking', {
  component   : BookingTemplate,
  childRoutes : [
    {
      path      : '/booking',
      component : require('views/booking/car')
    }
  ]
});