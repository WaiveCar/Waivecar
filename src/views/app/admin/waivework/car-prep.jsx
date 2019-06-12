import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

class CarPrep extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    api.get('/cars?type=workprep', (err, response) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: 'something', //err.message,
        });
      }
      console.log('response', response);
    });
  }

  render() {
    return <div>Car Prep</div>;
  }
}

export default CarPrep;
