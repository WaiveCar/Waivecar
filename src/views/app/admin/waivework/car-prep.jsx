import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';
import {Link} from 'react-router';

class CarPrep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: null,
      requiredItems: null,
    };
  }
  componentDidMount() {
    api.get('/cars?type=workprep', (err, response) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      let items = [];
      for (let item in response[0].requiredItems) {
        items.push(item);
      }
      response = response.map(car => {
        let completedCount = Object.keys(car.requiredItems).reduce(
          (acc, item) => (acc += car.requiredItems[item] ? 1 : 0),
          0,
        );
        return {...car, completedCount};
      });
      response.sort((a, b) => b.completedCount - a.completedCount);
      this.setState(state => ({
        cars: response,
        requiredItems: items,
      }));
    });
  }

  render() {
    let {cars, requiredItems} = this.state;
    return (
      <div id="car-prep" className="container">
        <div className="box full">
          <h3>Car Prep</h3>
          {cars && (
            <div className="box-content">
              <div className="row">
                <table className="box-table table-striped">
                  <thead>
                    <tr>
                      <th>License</th>
                      <th>In Repair</th>
                      <th>Repair Reason</th>
                      {requiredItems.map((item, i) => (
                        <th key={i}>{item[0].toUpperCase() + item.slice(1)}</th>
                      ))}
                      <th>Completed Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((car, i) => (
                      <tr key={i}>
                        <td>
                          <Link to={`/cars/${car.id}`}>{car.license}</Link>
                        </td>
                        <td>{car.inRepair ? 'yes' : 'no'}</td>
                        <td>{car.repairReason ? car.repairReason : 'no'}</td>
                        {requiredItems.map((item, i) => (
                          <td key={i}>
                            {typeof car.requiredItems[item] === 'boolean' ? (
                              car.requiredItems[item] ? (
                                <input type="checkbox" checked />
                              ) : (
                                <input type="checkbox" disabled="disabled" />
                              )
                            ) : (
                              car.requiredItems[item]
                            )}
                          </td>
                        ))}
                        {
                          <td>
                            {car.completedCount} / {requiredItems.length}
                          </td>
                        }
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default CarPrep;
