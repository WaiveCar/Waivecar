import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';
import {Link} from 'react-router';
import moment from 'moment';

class CarPrep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: null,
      requiredItems: null,
      selected: 'completed',
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
      response.sort(
        (a, b) => b.checklist.completedCount - a.checklist.completedCount,
      );
      this.setState(state => ({
        cars: response,
        requiredItems: response[0].checklist.requiredList,
      }));
    });
  }

  sortByItem(item) {
    let {cars} = this.state;
    let temp = [...cars];
    let asc = cars[0].checklist[item] && true;
    temp.sort((a, b) => {
      if (a.checklist[item] && b.checklist[item]) {
        if (typeof a === 'boolean' && typeof b === 'boolean') {
          return 0;
        } else {
          if (a.checklist[item] < b.checklist[item]) {
            return asc ? 1 : -1;
          }
          if (b.checklist[item] < a.checklist[item]) {
            return asc ? -1 : 1;
          }
          return 0;
        }
      }
      if (a.checklist[item]) {
        return asc ? 1 : -1;
      }
      if (b.checklist[item]) {
        return asc ? -1 : 1;
      }
      return 0;
    });
    if (item === 'completed') {
      let asc =
        cars[0].checklist.completedCount <
        cars[cars.length - 1].checklist.completedCount;
      temp.sort(
        (a, b) =>
          asc
            ? b.checklist.completedCount - a.checklist.completedCount
            : a.checklist.completedCount - b.checklist.completedCount,
      );
    }
    this.setState(state => ({
      cars: temp,
      selected: item,
    }));
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
                      <th
                        onClick={() =>
                          this.sortByItem('registrationExpiration')
                        }>
                        Registration Expiration
                        <span id={'registrationExpiration'} style={{display: 'none'}}>
                          ▼
                        </span>
                      </th>
                      <th
                        onClick={() => this.sortByItem('inspectionExpiration')}>
                        Inspection Expiration
                        <span id={'inspectionExpiration'} style={{display: 'none'}}>
                          ▼
                        </span>
                      </th>
                      {requiredItems.map((item, i) => (
                        <th key={i} onClick={() => this.sortByItem(item)}>
                          {item[0].toUpperCase() + item.slice(1)}
                          <span id={item} style={{display: 'none'}}>
                            ▼
                          </span>
                        </th>
                      ))}
                      <th onClick={() => this.sortByItem('completed')}>
                        Completed Items
                        <span id={'completed'}>▼</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((car, i) => (
                      <tr key={i}>
                        <td>
                          <Link to={`/cars/${car.id}`}>{car.license}</Link>
                        </td>
                        <td>
                          {car.inRepair ? (
                            <input
                              type="checkbox"
                              checked
                              onChange={() => null}
                            />
                          ) : (
                            <input type="checkbox" disabled="disabled" />
                          )}
                        </td>
                        <td>{car.repairReason ? car.repairReason : 'no'}</td>
                        <td>
                          {car.checklist.registrationExpiration &&
                            moment(car.checklist.registrationExpiration).format(
                              'MM/DD/YY',
                            )}
                        </td>
                        <td>
                          {car.checklist.inspectionExpiration &&
                            moment(car.checklist.inspectionExpiration).format(
                              'MM/DD/YYYY',
                            )}
                        </td>
                        {requiredItems.map((item, i) => (
                          <td key={i}>
                            {typeof car.checklist[item] === 'boolean' ? (
                              car.checklist[item] ? (
                                <input
                                  type="checkbox"
                                  checked
                                  onChange={() => null}
                                />
                              ) : (
                                <input type="checkbox" disabled="disabled" />
                              )
                            ) : (
                              car.checklist[item]
                            )}
                          </td>
                        ))}
                        {
                          <td>
                            {car.checklist.completedCount} /{' '}
                            {requiredItems.length}
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
