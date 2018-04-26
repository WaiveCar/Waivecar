import React    from 'react';
import { Link } from 'react-router';
import moment   from 'moment';
import { GMap }  from 'bento-web';
import { api, relay, dom }  from 'bento';
var _ = require('lodash');


const oneDay = 1000 * 60 * 60 * 24;
const shownList = ['work', 'waive', 'level', 'other'];
const LEVEL = 7;

module.exports = class CarsIndex extends React.Component {

  constructor(...options) {
    super(...options);

    this.state = {
      shownCars : [],
      showHelp : false,
      allCars : [],
      filter : {},
      shown : this.getShown(),
      sortBy: { key: "license", orderAsc: true }
    };

    this.columns = [
      {key : "license", title:"License", type : "text", comparator : this.licenseComparator.bind(this)},
      {key : "charge", title:"Charge", type : "text"},
      {key : "currentSpeed", title:"Speed", type : "text"},

      {key : "isIgnitionOn", title:"Ignition", type : "bool"},
      //{key : "isKeySecure", title:"Key Secure", type : "bool"},
      {key : "isLocked", title:"Locked", type : "bool"},
      {key : "isImmobilized", title:"Immobilized", type : "bool"},
      {key : "isCharging", title:"Charging", type : "bool"},
      {key : "statuscolumn", title:"Status", type : "status"},
      {key : "updatedAt", title:"Last Action", type : "lastaction"},
      // {key : "action", title:"Last Action", type : "text"},
      // {key : "actionAt", title:"Action At", type : "datetime"}
      //{key : "inService", title:"In Repair", type : "bool"}
    ];
  }

  update() {
    api.get(`/carsWithBookings`, (err, cars) => {
      cars.forEach((row) => {
        row.licenseLower = row.license.toLowerCase();
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
      } );
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
      [ 'notavailable', '!ava' ],
      [ 'booked', 'boo' ],
      [ 'notbooked', '!boo' ],
      [ 'charging', 'char' ],
      [ 'notcharging', '!char'],
      [ 'low', 'low' ],
      [ 'high', 'high' ]
    ];
    bMap.forEach((row) => {
      if(filter.includes(row[1])) {
        opts[row[0]] = true;
        isFlagged = true;
      }
    });
    // ex: charging is a string subset of !charging
    ['charging', 'available', 'booked'].forEach((row) => {
      opts[row] &= !opts['not' + row];
    });

    console.log(opts);
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
        waive: lic.indexOf('waive') > -1,
        work: lic.indexOf('work') > -1,
        level: car.groupCar.length ? car.groupCar[0].groupRoleId === LEVEL : false
      };

      return (
        (shownMap.level && res.level) ||
        (shownMap.waive && (res.waive && !res.level)) ||
        (shownMap.work && res.work)   ||
        (shownMap.other && !res.level && !res.work && !res.waive)  
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
      res = car.licenseLower.includes(opts.raw) || car.name.includes(opts.raw);
      if(!res && opts.isFlagged) {
        res = true;
        // this allows us to search for say "low available"
        if(opts.available) { res &= car.isAvailable; }
        if(opts.notavailable) { res &= (!car.isAvailable && !car.name); }
        if(opts.booked) { res &= car.name; }
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

    if (column.type === "lastaction") {
      let duration = (moment.duration(moment.utc().diff(moment(car.lastActionTime)))).asMilliseconds();
      let value = moment.utc(duration).format('H:mm');

      if(duration > oneDay) {
        value = Math.floor(duration/oneDay) + 'd ' + value;
      }

      return <td key={column.key}>{ value }</td>
    }

    if (column.type === "status") {
      if (car.user) {
        let name = `${car.user.firstName } ${ car.user.lastName }`;
        value = <a title={name} href={ '/users/' + car.user.id }>{name}</a>
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

  renderColumnHeader( column) {
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

  renderCarRow(car) {
    return (
      <tr className="standard-row" key={car.id}>
        {
          this.columns.map((column) => this.renderCell(car, column))
        }
        <td key="actions"><div className="text-center"><a className="grid-action" href={"/cars/" + car.id}><i className="material-icons" role="edit">edit</i></a></div></td>
      </tr>
    )
  }

  renderListLinkItem(item, index) {
    let route = `/cars/${ item.id }`;

    let duration = (moment.duration(moment.utc().diff(moment(item.lastActionTime)))).asMilliseconds();
    let value = moment.utc(duration).format('H:mm');

    if(duration > oneDay) {
      value = Math.floor(duration/oneDay) + 'd ' + value;
    }
    let text = <span>{ item.id } <small className="pull-right">{ value }</small></span>


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
        let word = item.statuscolumn;
        let home = '';
        if (item.isCharging) { 
          word = 'Charging';
        }
        // This is the pico office.
        if (item.latitude > 34.019808 && item.latitude < 34.019950 && item.longitude > -118.468597 && item.longitude < -118.467835) {
          home = <i className="fa fa-home"></i>;
        }
        name = <em>{item.charge}% { word } {home}</em>
      }

      text = <span><span className='carname'>{ item.license }</span> <small>{ name }</small><small className="cartime pull-right">{ value }</small></span>
    }

    return (
      <Link key={ index } className="list-group-item" to={ route }>
        { text }
      </Link>
    );
  }

  renderShownFilters() {
    return (
      <div className="form-group row">
        { shownList.map((what) =>
           <div className="radio-inline"> 
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
               value={this.state.filter.raw}
               onChange={ (e) => this.onFilter(e)}
          />
          { this.state.showHelp && <ul className="help">
            <li> (term) - (meaning) </li>
            <li> ava - available </li>
            <li> !ava - unavailable </li>
            <li> char - charging </li>
            <li> !char - not charging </li>
            <li> book - booked </li>
            <li> !book - not booked </li>
            <li> high - over 70% </li>
            <li> low - under 30% </li>
            <li> help - this screen </li>
            </ul>
          }
      </div>
    )
  }

  render() {
    if (!this.state.shownCars.length) {
      return false;
    }

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

                    { this.renderShownFilters() }

                    <div className="griddle-container">
                      <div className="griddle-body">
                        <div>
                          <table>
                            <thead>
                            <tr>
                              {
                                this.columns.map((column) => this.renderColumnHeader(column))
                              }
                              <th data-title="actions" ><span>Actions</span></th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                              this.state.shownCars
                                .filter((car) => this.isCarIncludes(car, this.state.filter) )
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
                  <small>Updated: { this.state.updated } <a style={{cursor:'pointer', padding: '0 1em'}} onClick={ this.update.bind(this) }>refresh</a></small>
                  <div className="list-group">
                    {
                      this.state.shownCars
                        ? this.state.shownCars
                          .filter((car) => this.isCarIncludes(car, this.state.filter) )
                          .sort(this.licenseComparator).map(this.renderListLinkItem.bind(this))
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
