import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';
import Space from '../../components/user/user-parking/space.jsx';

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
          type: 'danger',
          message: 'Error fetching spaces.',
        });
      }
      this.setState({spaces: response});
    });
  }

  render = () => {
    let {spaces} = this.state;
    return (
      <div className="container">
        <div className="box full">
          <h3>WaivePark Spaces</h3>
          <div className="box-content">
            {spaces && spaces.map((space, i) => <Space key={i} space={space} />)}
          </div>
        </div>
      </div>
    );
  };
}

export default WaivePark;
