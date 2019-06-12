import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';
import ThSort from '../components/table-th';

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
    let {cars} = this.state;
    return (
      <div id="bookings-list" className="container">
        <div className="box full">
          <h3>Car Prep</h3>
          <div className="box-content">
            <div className="row">
              <table className="box-table table-striped">
                <thead>
                </thead>
                <tbody>
                  {cars &&
                    cars.map((car, i) => <div key={i}>{car.license}</div>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CarPrep;
