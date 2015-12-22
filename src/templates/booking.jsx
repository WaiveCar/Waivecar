import React         from 'react';
import { relay }     from 'bento';
import { templates } from 'bento-ui';

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

templates.register('booking', {
  component   : BookingTemplate,
  childRoutes : [
    {
      path      : '/booking',
      component : require('views/booking/car')
    }
  ]
});
