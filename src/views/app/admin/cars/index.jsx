import React    from 'react';
import { Link } from 'react-router';
import moment   from 'moment';
import { GMap }  from 'bento-web';
import { api, relay, dom, auth }  from 'bento';
var _ = require('lodash');


const oneDay = 1000 * 60 * 60 * 24;
const shownList = ['work', 'waive', 'level', 'csula', 'other'];
const LEVEL = 7;
const CSULA = 11;

module.exports = class CarsIndex extends React.Component {

  constructor(...options) {
    super(...options);
    this._user = auth.user();
    this.userOrganizations = this._user.organizations.map(each => each.organizationId);

    this.columns = [
      {key : "license", title:"Car Name", type : "text", comparator : this.licenseComparator.bind(this), noToggle: true},
      {key : "charge", title:"Charge", type : "text"},
      {key : "lastTimeAtHq", title:"Last At HQ", type : "duration"},

      {key : "isIgnitionOn", title:"Ignition", type : "bool"},
      //{key : "isKeySecure", title:"Key Secure", type : "bool"},
      {key : "isLocked", title:"Locked", type : "bool"},
      {key : "isImmobilized", title:"Immobilized", type : "bool"},
      {key : "isCharging", title:"Charging", type : "bool"},
      {key : "statusColumn", title:"Status", type : "status", noToggle: true},
      {key : "lastActionTime", title:"Last Action", type : "duration"},
      // {key : "action", title:"Last Action", type : "text"},
      // {key : "actionAt", title:"Action At", type : "datetime"}
      //{key : "inService", title:"In Repair", type : "bool"}
    ];
    let storedCols = localStorage.getItem('selectedCols');
    this.state = {
      shownCars : [],
      showHelp : false,
      allCars : [],
      filter : {},
      shown : this.getShown(),
      sortBy: { key: "license", orderAsc: true },
      selectedCols: new Set(storedCols ? 
        new Set(JSON.parse(storedCols)) : 
        new Set(this.columns.map(col => col.key)),
      ),
      selectedCars: new Set(),
      masterChecked: false,
    };
  }

  update(cb) {
    let moment = require('moment');
    let start = moment();
    api.get(`/carsWithBookings${this.userOrganizations.length ?
      `?organizationIds=[${this.userOrganizations}]` : ''
    }`, (err, cars) => {
      cars.forEach((row) => {
        row.licenseLower = row.license.toLowerCase();
        row.plateLower = row.plateNumber ? row.plateNumber.toLowerCase() : '';
        if(row.user) {
          row.name = [row.user.firstName, row.user.lastName].join(' ').toLowerCase();
        } else {
          row.name = '';
        }
      });
      this.setState( {
        updated: moment().format('HH:mm:ss'),
        allCars: cars,
        shownCars: this.runShown({cars: cars})
      }, () => console.log('Time elapsed during cars route call: ', moment().diff(start, 'seconds')), cb && cb(cars));
    });
  }

  componentDidMount() {
    dom.setTitle("Cars");
    this.update();
  }

  onFilter(event) {
    let filter = event.target.value.toLowerCase();
    let opts = { raw: filter };
    let isFlagged = false;
    let bMap = [ 
      [ 'available', 'ava' ],
      [ 'notavailable', 'noava' ],
      [ 'booked', 'boo' ],
      [ 'notbooked', 'noboo' ],
      [ 'charging', 'char' ],
      [ 'notcharging', 'nochar'],
      [ 'low', 'low' ],
      [ 'high', 'high' ]
    ];
    bMap.forEach((row) => {
      if(filter.includes(row[1])) {
        opts[row[0]] = true;
        isFlagged = true;
      } else {
        opts[row[0]] = false;
      }
    });
    // ex: charging is a string subset of !charging
    ['charging', 'available', 'booked'].forEach((row) => {
      opts[row] &= !opts['not' + row];
    });

    opts.isFlagged = isFlagged;
    this.setState({
      showHelp: filter === 'help',
      filter: opts
    });
  }

  // this looks to be unavoidaly O(M*N)
  runShown(opts) {
    let cars = opts.cars || this.state.allCars;
    let shown = opts.shown || this.state.shown;
    let shownMap = {};

    shown.forEach((what) => {
      shownMap[what] = true;
    });

    let shownList = cars.filter((car) => {
      let lic = car.license.toLowerCase();
      let res = {
        waive: lic.includes('waive'),
        work: lic.includes('work'),
        level: car.tagList.length ? car.tagList[0].groupRoleId === LEVEL : false,
        csula: car.tagList.length ? car.tagList[0].groupRoleId === CSULA : false
      };

      return (
        (shownMap.level && res.level) ||
        (shownMap.waive && (res.waive && !res.csula && !res.level)) ||
        (shownMap.csula && res.csula) ||
        (shownMap.work && res.work)   ||
        (shownMap.other && !res.csula && !res.level && !res.work && !res.waive)  
      );
    });
    return shownList;
  }

  updateShown(e) {
    let shown = this.state.shown;
    if(e.target.checked) {
      shown.push(e.target.value);
    } else {
      shown = _.without(shown, e.target.value);
    }
    localStorage['carShown'] = shown.join(',');
    this.setState({
      shown: shown,
      shownCars: this.runShown({shown: shown})
    });
  }

  getShown() {
    if(localStorage['carShown']) {
      return localStorage['carShown'].split(',');
    }
    return shownList;
  }

  isShown(what) {
    return this.state.shown.indexOf(what) > -1;
  }

  isCarIncludes(car, opts) {
    let res = true;
    if (opts.raw) { 
      res = car.licenseLower.includes(opts.raw) || car.name.includes(opts.raw) || car.plateLower.includes(opts.raw);
      if(!res && opts.isFlagged) {
        res = true;
        // this allows us to search for say "low available"
        if(opts.available) { res &= car.isAvailable; }
        if(opts.notavailable) { res &= (!car.isAvailable && !car.name); }
        if(opts.booked) { res &= car.name.length; }
        if(opts.notbooked) { res &= !car.name; }
        if(opts.charging) { res &= car.isCharging; }
        if(opts.notcharging) { res &= !car.isCharging; }
        if(opts.low) { res &= car.charge < 30; }
        if(opts.high) { res &= car.charge > 70; }
      }
    }
    return res;
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

    if (column.type == "bool") {
      return <td className="table-col-xs" key={column.key}>{ this.renderCheckMark(value)}</td>
    }

    if (column.type == "datetime") {
      let date = moment(value).format('HH:mm:ss MM-DD-YY');
      return <td title={date} key={column.key}><span>{date}</span></td>
    }

    if (column.type == "duration") {
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

    if (column.type === "status") {
      if (car.user) {
        let name = `${car.user.firstName } ${ car.user.lastName }`;
        value = <a title={name} href={ '/users/' + car.user.id }>{name}</a>
      } else {
        value = car.isAvailable ? 'Available' : 'Unavailable';
      }
      return <td key={column.key}>{value}</td>
    }

    return <td title={value} key={column.key}>{value}</td>
  }

  sort(event) {
    var columnKey = event.target.dataset.title||event.target.parentElement.dataset.title;

    var orderAsc = true;

    if (this.state.sortBy) {
       if (this.state.sortBy.key == columnKey) {
         orderAsc = !this.state.sortBy.orderAsc;
       }
    }
    this.setState({
      sortBy : {key : columnKey, orderAsc: orderAsc}
    })
  }

  defaultComparator(valA, valB) {
    return valA - valB;
  }

  licenseComparator(valA, valB) {
    if (valA.hasOwnProperty('license')) {
      valA = valA.license;
      valB = valB.license;
    }

    valA = valA.toLowerCase();
    valB = valB.toLowerCase();
    let partsA = valA.match(/([a-z]*)\s*(\d*)/i);
    let partsB = valB.match(/([a-z]*)\s*(\d*)/i);

    if(partsA[1] === partsB[1]) {
      return parseInt(partsA[2], 10) - parseInt(partsB[2], 10);
    } else {
      // This strangeness is done in order to keep the groupings
      // far enough away from each other in the quicksort calculation
      return (partsA[1] < partsB[1]) ? 1000 : -1000;
    }
  }

  sortComparator(a, b) {
    let sortBy = this.state.sortBy;
    if (!sortBy) {
      return 0;
    }

    let comparator = this.defaultComparator;

    let sortingCol = this.columns.filter((col) => col.key == sortBy.key);
    if (sortingCol.length && sortingCol[0].comparator) {
      comparator = sortingCol[0].comparator;
    }

    var comparisonResult = comparator(a[sortBy.key], b[sortBy.key])

    if (!sortBy.orderAsc) {
      comparisonResult = -comparisonResult;
    }

    return comparisonResult;
  }

  renderColumnHeader(column) {
    var className = "";

    if (column.type == "bool") {
      className = "table-col-xs";
    }

    if (column.type == "datetime") {
      className="table-col-lg"
    }

    var sortBy = this.state.sortBy;

    return (
      <th data-title={column.key} className={className} key={column.key} onClick={ (e) => this.sort(e) } >
        <span>{column.title}</span>
        {
          sortBy && sortBy.key == column.key
            ? <span>{sortBy.orderAsc ? " ▲" : " ▼" }</span>
            : ""
        }
      </th>
    )
  }

  toggleSelectedCar(car) {
    let {selectedCars, masterChecked} = this.state;
    if (selectedCars.has(car)) {
      selectedCars.delete(car);
    } else {
      selectedCars.add(car);
    }
    this.setState({selectedCars, masterChecked: false});
  } 

  toggleAllCars(e, displayedCars) {
    let {selectedCars} = this.state;
    if (!e.target.checked) {
      this.setState({selectedCars: new Set(), masterChecked: false});
    } else {
      this.setState({selectedCars: new Set(displayedCars), masterChecked: true});
    }
  }

  renderCarRow(car) {
    let {selectedCols, selectedCars} = this.state;
    return (
      <tr className="standard-row" key={car.id}>
        <td>
          <input 
            type="checkbox" 
            onChange={() => this.toggleSelectedCar(car)}
            checked={selectedCars.has(car)}
          />
        </td>
        {
          this.columns.filter(col => selectedCols.has(col.key)).map((col) => this.renderCell(car, col))
        }
        <td key="actions"><div className="text-center"><a className="grid-action" href={"/cars/" + car.id}><i className="material-icons" role="edit">edit</i>expand</a></div></td>
      </tr>
    )
  }

  //
  // These are the colunns for the mobile view. 
  // They are special in that they aren't really 
  // "columns" in a tabular sense nor are they
  // sortable.
  //
  renderListLinkItem(item, index) {
    let route = `/cars/${ item.id }`;

    let durationMap = {
      lastAction: { num: (moment.duration(moment.utc().diff(moment(item.lastActionTime)))).asMilliseconds() },
      lastSeen: { num: (moment.duration(moment.utc().diff(moment(item.lastTimeAtHq)))).asMilliseconds() }
    };

    Object.keys(durationMap).forEach((key) => {
      let str = moment.utc(durationMap[key].num).format('H:mm');
      if(durationMap[key] > oneDay) {
        str = Math.floor(durationMap[key].num/oneDay) + 'd ' + str;
      }
      durationMap[key].str = str;
    })

    let text = <span>{ item.id } <small className="pull-right">{ durationMap.lastAction.str }</small></span>


    if (item.license) {
      let name = '';

      if (item.user) {
        name = [item.user.firstName, item.user.lastName];
        if (item.booking) {
          let duration = moment.duration(moment.utc().diff(moment(item.booking[0].createdAt)));
          name.unshift( moment.utc(duration.asMilliseconds()).format('H:mm') );
        }
        name = name.join(' ');
      } else {
        let word = item.statusColumn;
        let home = '';
        let repair = '';
        let lock = '';
        let charge = '';
        if (item.isCharging) { 
          charge = <i style={{ color: 'blue' }} className="fa fa-bolt"></i>
        }
        if (word == 'Available') {
          word = <b>{ word }</b>
        }
        if (item.latitude > 34.019708 && item.latitude < 34.02 && item.longitude > -118.468597 && item.longitude < -118.467835) {
          home = <i className="fa fa-home"></i>;
          // This is the pico office.
          if(!item.isLocked) {
            if(item.isImmobilized) {
              lock = <i className="fa fa-unlock"></i>
            } else {
              lock = <i style={{ color: 'red', fontWeight: 'bold', fontSize: '120%' }} className="fa fa-unlock"></i>
            }
          }
        }
        if (item.inRepair) {
          repair = <i className="fa fa-wrench"></i>
        }
        name = <em>{item.charge}% { word } { home }{ repair } { charge } { lock }</em>
      }

      text = <span><span className='carname'>{ item.license }</span> <small>{ name }</small><small className="cartime pull-right">{ durationMap.lastAction.str }</small></span>
    }

    return (
      <Link target="_blank" key={ index } className="list-group-item" to={ route }>
        { text }
      </Link>
    );
  }

  renderShownFilters(count) {
    return (
      <div className="form-group row butnotfuckedup">
        { shownList.map((what, i) =>
           <div className="radio-inline" key={i}> 
             <label><input type="checkbox" name="filter[]" onChange={ this.updateShown.bind(this) } defaultChecked={ this.isShown(what) } value={ what } /> { what } </label>
           </div>
          )
        }
      </div>
    );
  }

  renderSearch() {
    return (
      <div className="filter-container" >
        <input type="text"
               name="filter"
               placeholder="Filter Results"
               className="form-control"
               autoComplete="off"
               onChange={ (e) => this.onFilter(e)}
          />
          { this.state.showHelp && <ul className="help">
            <li> (term) - (meaning) </li>
            <li> ava - available </li>
            <li> noava - unavailable </li>
            <li> char - charging </li>
            <li> nochar - not charging </li>
            <li> book - booked </li>
            <li> nobook - not booked </li>
            <li> high - over 70% </li>
            <li> low - under 30% </li>
            <li> help - this screen </li>
            </ul>
          }
      </div>
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

  selectColumns() {
    let {selectedCols} = this.state;
    return (
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
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

  render() {
    if (!this.state.shownCars.length) {
      return false;
    }
    let {selectedCols, masterChecked} = this.state;
    let displayedCars = this.state.shownCars.filter((car) => this.isCarIncludes(car, this.state.filter) );
    return (
      <div className="cars-index" >
        <section className="container" >
          <div className="row">
            <div className="col-xs-12" >
              <div id="table-component" className="component-container" >
                <div className="hidden-md-down">
                  <div className="griddle" >
                    <div className="top-section" >
                      <div className="griddle-filter" >
                        { this.renderSearch() }
                      </div>
                    </div>

                    { this._user.hasAccess('waiveAdmin') && this.renderShownFilters(displayedCars.length) }
                    <h4 style={{marginTop: '1rem'}}>Selected Columns:</h4>
                    {this.selectColumns()}
                    <div className="griddle-container">
                      <div className="griddle-body">
                        <div>
                          <table>
                            <thead>
                            <tr>
                              <th>
                                <input type="checkbox" onChange={(e) => this.toggleAllCars(e, displayedCars)} checked={masterChecked}/>
                              </th>
                              {
                                this.columns.filter(col => selectedCols.has(col.key)).map((col) => this.renderColumnHeader(col))
                              }
                              <th data-title="actions" ></th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                              displayedCars
                                .sort((a, b) => this.sortComparator(a, b))
                                .map((car) => this.renderCarRow(car))
                            }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
                <div className="hidden-lg-up visible-md-down">
                  { this.renderSearch() }
                  <small>Updated: { this.state.updated } <a style={{cursor:'pointer', padding: '0 1em'}} onClick={ this.update.bind(this) }>refresh</a> (Showing { displayedCars.length })</small>
                  <div className="list-group">
                    {
                      this.state.shownCars
                        ? displayedCars.sort(this.licenseComparator).map(this.renderListLinkItem.bind(this))
                        : <div className="list-group-item">Loading</div>
                    }
                  </div>
                  { this.renderShownFilters() }
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12" >
              <div className="map-dynamic">
                <GMap
                    markerIcon = { '/images/map/active-waivecar.svg' }
                    markers    = { this.state.shownCars }
                  />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

};
