import React    from 'react';
import { Link } from 'react-router';
import moment   from 'moment';
import { GMap, snackbar }  from 'bento-web';
import { api, relay, dom, auth }  from 'bento';
import Organizations from '../organizations/organizations-search.jsx';
import CarsTable from './cars-table';
import ThSort from '../components/table-th';

const oneDay = 1000 * 60 * 60 * 24;

module.exports = class CarsIndex extends React.Component {

  constructor(...options) {
    super(...options);
    this._user = auth.user();
    this.userOrganizations = this._user.organizations.map(each => each.organizationId);

    this.columns = [
      {key : 'license', title: 'Car Name', type : 'license', /*comparator : this.licenseComparator.bind(this),*/ noToggle: true, makeLowerCase: true},
      {key: 'vin', title: 'VIN', type: 'text', defaultHidden: true},
      {key : 'charge', title:'Charge/Fuel Level', type : 'text'},
      {key : 'isLocked', title:'Locked', type : 'bool'},
      {key : 'isImmobilized', title:'Immobilized', type : 'bool'},
      {key : 'isCharging', title:'Charging', type : 'bool', defaultHidden: true},
      {key : 'statusColumn', title:'Status', type : 'status', noToggle: true},
      {key: 'openTicketCount', title: 'Open Tickets', type: 'text', defaultHidden: true},
      {key: 'plateNumber', title: 'Plate Number', type: 'text', defaultHidden: true},
      {key: 'plateState', title: 'Plate State', type: 'text', defaultHidden: true},
      {key: 'manufacturer', title: 'Make', type: 'text', defaultHidden: true},
      {key: 'maintenanceDueAt', title: 'Maintenance Due At', type: 'text', defaultHidden: true},
      {key: 'maintenanceDueIn', title: 'Maintenance Due In', type: 'text', defaultHidden: true},
      {key: 'serviceInterval', title: 'Maintenance Interval', type: 'text', defaultHidden: true},
      {key: 'model', title: 'Model', type: 'text', defaultHidden: true},
      {key: 'totalMileage', title: 'Mileage', type: 'text', defaultHidden: true},
      {key: 'organizationName', title: 'Organization', type: 'org'},
    ];
    this.actions = [
      'lock', 
      'unlock', 
      'lock-immobilizer', 
      'unlock-immobilizer', 
    ];
    if (this._user.hasAccess('waiveAdmin')) {
      this.actions.push('super-immobilize', 'super-unimmobilize');
    }
    let storedCols = localStorage.getItem('selectedCols');
    this.state = {
      selectedCols: new Set(storedCols ? 
        new Set(JSON.parse(storedCols)) : 
        new Set(this.columns.map(col => !col.defaultHidden && col.key)),
      ),
      showColumnSelected: false,
      selectedCars: new Set(),
      carMap: {},
      masterChecked: false,
      carsWithBookings: [],
    };
  }

  componentDidMount() {
    dom.setTitle('Cars');
  }

  renderCheckMark(checked) {
    if (checked) {
      return (
        <span className="text-success"><i className="material-icons" role="true">check</i></span>
      )
    } else {
      return (
        <span className="text-muted"><i className="material-icons" role="true">close</i></span>
      )
    }
  }

  renderCell(car, column) {
    var value = car[column.key];
    if (column.type === 'airtable') {
      let airtableData = JSON.parse(car.airtableData);
      return airtableData ? (
        <td className="table-col-xs" key={column.key}>
          {airtableData.fields[column.key]}
        </td>
      ) : <td key={column.key} className="table-col-xs">No Data</td>;
    }
    if (column.type === 'org') {
      value = car.organizationName || 'none';
      let color = car.organizationName ? 'green' : 'red';
      return (
        <td className="table-col-xs" style={{color}} key={column.key}>
          {car.organization ? 
            <Link to={`/organizations/${car.organization.id}`}>{value}</Link>
            : value}
        </td>)
    }
    if (column.type == 'bool') {
      return <td className="table-col-xs" key={column.key}>{ this.renderCheckMark(value)}</td>
    }

    if (column.type == 'datetime') {
      let date = moment(value).format('HH:mm:ss MM-DD-YY');
      return <td title={date} key={column.key}><span>{date}</span></td>
    }

    if (column.type == 'duration') {
      if(!car[column.key]) {
        value = '-';
      } else {
        let duration = (moment.duration(moment.utc().diff(moment(car[column.key])))).asMilliseconds();
        value = moment.utc(duration).format('H:mm');

        if(duration > oneDay) {
          value = Math.floor(duration/oneDay) + 'd ' + value;
        }
      }
      return <td key={column.key}>{ value }</td>
    }

    if (column.type === 'status') {
      if (car.user) {
        let name = `${car.user.firstName } ${ car.user.lastName }`;
        value = <a title={name} href={ '/users/' + car.user.id }>{name}</a>
      } else {
        value = car.isAvailable ? 'Available' : 'Unavailable';
      }
      return <td key={column.key}>{value}</td>
    }
    if (column.type === 'license') {
      return (
        <td key={column.key}>
          <Link to={`/cars/${car.id}`}>{value}</Link>
        </td>
      );
    }
    if (!value) {
      value = 'Not Provided';
    }
    return <td title={value} key={column.key}>{value}</td>
  }

  toggleSelectedCar(car) {
    let {selectedCars, masterChecked} = this.state;
    if (selectedCars.has(car.license)) {
      selectedCars.delete(car.license);
    } else {
      selectedCars.add(car.license);
    }
    this.setState({selectedCars, masterChecked: false});
  } 

  toggleAllCars(e, carsWithBookings) {
    let {selectedCars} = this.state;
    if (!e.target.checked) {
      this.setState({selectedCars: new Set(), masterChecked: false});
    } else {
      this.setState({selectedCars: new Set(carsWithBookings.map(car => car.license)), masterChecked: true});
    }
  }

  renderCarRow(car, i) {
    let {selectedCols, selectedCars} = this.state;
    return (
      <tr key={i}>
        <td>
          <input 
            type="checkbox" 
            onChange={() => this.toggleSelectedCar(car)}
            checked={selectedCars.has(car.license)}
          />
        </td>
        {
          this.columns.filter(col => selectedCols.has(col.key)).map((col) => this.renderCell(car, col))
        }
      </tr>
    )
  }

  toggleColumn(key) {
    let {selectedCols} = this.state;
    if (selectedCols.has(key)) {
      selectedCols.delete(key);
    } else {
      selectedCols.add(key);
    }
    this.setState({selectedCols});
    localStorage.setItem('selectedCols', JSON.stringify(selectedCols));
  }

  selectColumns(mobile) {
    let {selectedCols} = this.state;
    return (
      <div>
        <h4 style={{marginTop: '1rem'}}>Selected Columns:</h4>
        {this.columns.filter(col => !col.noToggle).map((col, i) => (
          <div key={i}>
            <input
              onChange={() => this.toggleColumn(col.key)}
              type={'checkbox'}
              name={`prop-${i}`}
              id={`prop-${i}`}
              style={{verticalAlign: 'middle', marginRight: '5px'}}
              checked={selectedCols.has(col.key)}
            />
            <label htmlFor={`prop-${i}`}>{col.title}</label>
          </div>
        ))}
      </div>
    );
  }

  batchAction(action, carsWithBookings) {
    let {selectedCars} = this.state;
    api.post(`/cars/batch/${action}`, {
      carList: carsWithBookings.filter(car => selectedCars.has(car.license)),
    }, (err, res) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      } 
      if (res.failures.length) {
        return snackbar.notify({
          type: 'danger',
          message: `${res.failures.map(car => car.license).join(', ')} failed to ${action}.`,
        });
      }
      return snackbar.notify({
        type: 'success',
        message: `${action} successful on all cars.`
      });
    });
  }
  
  getCSVFromTable() {
    let toJoin = [];
    let table = this.refs['table-ref'];
    let headerCells = table.querySelectorAll('thead tr th');
    let headerRow = [];
    headerCells.forEach(cell => {
      headerRow.push(cell.textContent);
    });
    toJoin.push(headerRow.join(','));
    let rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      let currentRow = [];
      for (let child of row.children) {
        currentRow.push(child.textContent);
      }
      toJoin.push(currentRow.join(','));
    });
    this.downloadCSV(toJoin.join('\n'));
  } 

  downloadCSV(csv) {
    let csvFile = new Blob([csv], {type: 'text/csv'});
    let downloadLink = document.createElement('a');
    downloadLink.download = 'cars.csv';
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }

  render() {
    let {showBatchActions} = this.state;
    let {showColumnSelected, selectedCols, selectedCars, masterChecked, carMap, carsWithBookings} = this.state;
    return (
      <div className="cars-index box full">
        <section className="container" >
            <h3>Cars</h3>
          <div className="box-content">
            <div className="row">
              <div className="col-xs-12" >
                <div id="table-component" className="component-container" >
                  { this._user.hasAccess('waiveAdmin') &&
                    <div>
                      <button className="btn btn-sm btn-primary" onClick={() => this.setState({showBatchActions: !showBatchActions})}>
                        {!showBatchActions ? 'Show' : 'hide'} batch actions
                      </button>
                    </div>
                  }
                  {showBatchActions && this._user.hasAccess('waiveAdmin') ? (
                    <div className="row">
                      <div>
                        <div className="box">
                          <h3><span>Batch Car Actions</span><small>(on all selected)</small></h3>
                          <div className="box-content">
                            {this.actions.map((action, i) => (
                              <button className="btn btn-primary" key={i} onClick={() => this.batchAction(action, carsWithBookings)}>
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Organizations type={'cars'} 
                          cars={carsWithBookings.filter(car => selectedCars.has(car.license))} 
                          _user={this._user} 
                          updateCars={() => this.update()}/> 
                      </div>
                    </div>
                  ) : ''}
                <button className="btn btn-sm btn-primary col-select" onClick={() => this.setState({showColumnSelected: !showColumnSelected})}>
                  {!showColumnSelected ? 'Show' : 'Hide'} Column Selection
                </button>
                {showColumnSelected && this.selectColumns()}
                  <div ref="table-ref">
                    <CarsTable
                      ref="cars-resource"
                      organizationIds={this.userOrganizations}
                      updateParent={(carsWithBookings) => {
                        let carMap = {};
                        for (let car of carsWithBookings) {
                          carMap[car.license] = car;
                        }
                        this.setState({
                          carsWithBookings, 
                          selectedCars: new Set(carsWithBookings.filter(car => selectedCars.has(car.license)).map(each => each.license)),
                          carMap,
                          masterChecked: false,
                        })
                      }}
                      header={() => (
                        <tr ref="sort">
                          <th>
                            <input type="checkbox" onChange={(e) => this.toggleAllCars(e, carsWithBookings)} checked={masterChecked}/>
                          </th>
                          {this.columns.filter(col => selectedCols.has(col.key)).map((col, i) => { 
                            return <ThSort
                              key={col.key}
                              sort={col.key}
                              value={col.title}
                              ctx={this.refs['cars-resource']}
                              makeLowerCase={col.makeLowerCase}
                            />
                          })}
                        </tr>
                      )}
                      row={(car, i) => this.renderCarRow(car, i)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <button className="btn btn-primary get-csv" onClick={() => this.getCSVFromTable()}>Get CSV</button>
            </div>
            <div className="row">
              <div className="col-xs-12" >
                <div className="map-dynamic">
                  <GMap
                      markerIcon = { '/images/map/active-waivecar.svg' }
                      markers    = {Array.from(selectedCars).map(license => carMap[license])}
                    />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

};
