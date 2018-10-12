import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

class WaivePark extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spaces: [],
    };
  }

  componentDidMount() {
    api.get('/parking', (err, response) => {
      if (err) {
        snackbar.notify({
          type    : 'danger',
          message : 'Error fetching spaces.'
        });
      }
      console.log('response: ', response);
    });
  }

  render = () => (
    <div className="container">
      <div className="box full">
        <h3>WaivePark Spaces</h3>
        <div className="box-content">
          Box Content
        </div>
      </div>
    </div>
  );
}

export default WaivePark;
