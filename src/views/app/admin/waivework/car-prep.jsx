import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

class CarPrep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: null,
    };
  }
  componentDidMount() {
    api.get('/cars?type=workprep', (err, response) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: 'something', //err.message,
        });
      }
      this.setState(state => ({
        cars: response,
      }));
    });
  }

  render() {
    return (
      <div id="content">
        <div className="content-wrapper">
          <div className="box full">
            <h3>Car Prep</h3>
            <div className="box-content">
              <div className="container">
                <div className="row">
                  <div className="col-xs-12" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CarPrep;
