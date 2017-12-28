import React    from 'react';
import { Link } from 'react-router';
import moment   from 'moment';
import { GMap }  from 'bento-web';
import { api, relay, dom }  from 'bento';

module.exports = class CarsIndex extends React.Component {

  constructor(...options) {
    super(...options);

    this.state = {
      cars : [],
      filter : "",
      sortBy: { key: "license", orderAsc: true }
    };

    this.columns = [
      {key : "license", title:"License", type : "text", comparator : this.licenseComparator.bind(this)},
      {key : "charge", title:"Charge", type : "text"},
      {key : "currentSpeed", title:"Speed", type : "text"},

      {key : "isIgnitionOn", title:"Ignition", type : "bool"},
      {key : "isKeySecure", title:"Key Secure", type : "bool"},
      {key : "isLocked", title:"Locked", type : "bool"},
      {key : "isImmobilized", title:"Immobilized", type : "bool"},
      {key : "isCharging", title:"Charging", type : "bool"},
      {key : "statuscolumn", title:"Status", type : "status"},
      {key : "updatedAt", title:"Updated At", type : "datetime"},
      {key : "action", title:"Last Action", type : "text"},
      {key : "actionAt", title:"Action At", type : "datetime"}
      //{key : "inService", title:"In Repair", type : "bool"}
    ];
  }

  update() {
    api.get(`/carsWithBookings`, (err, cars) => {
      this.setState( {
        updated: moment().format('HH:mm:ss'),
        cars: cars 
      } );
    });
  }

  componentDidMount() {
    dom.setTitle("Cars");
    this.update();
  }

  onFilter(event) {
    this.setState({filter: event.target.value});
  }

  isCarIncludes(car, str) {
    str = str.toLowerCase();
    return this.columns.filter((column) => {
      if (column.key == "license") {
        var value = car[column.key];
        return value && value.toString().toLowerCase().includes(str);
      }
      return false;
    }).length > 0;
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

  licCompare(valA, valB) {
    return (parseInt(valA.license.replace(/\D/g,''), 10) || 10000) - (parseInt(valB.license.replace(/\D/g,''), 10) || 10000);
  }

  licenseComparator(valA, valB) {
    return (parseInt(valA.replace(/\D/g,''), 10) || 10000) - (parseInt(valB.replace(/\D/g,''), 10) || 10000);
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
    let text = <span>{ item.id } <small className="pull-right">{ updated }</small></span>
    let updated = moment(item.updatedAt).format('HH:mm');
    let updatedFull = moment(item.updatedAt).format('HH:mm:ss MM-DD-YY');

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
        if (item.isCharging) { 
          word = 'Charging';
        }
        name = <em>{item.charge}% { word }</em>
      }

      text = <span><span className='carname'>{ item.license }</span> <small>{ name }</small><small title={updatedFull} className="cartime pull-right">{ updated }</small></span>
    }

    return (
      <Link key={ index } className="list-group-item" to={ route }>
        { text }
      </Link>
    );
  }

  render() {
    if (!this.state.cars.length) {
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
                        <div className="filter-container" >
                          <input type="text"
                                 name="filter"
                                 placeholder="Filter Results"
                                 className="form-control"
                                 value={this.state.filter}
                                 onChange={ (e) => this.onFilter(e)}
                            />
                        </div>
                      </div>
                    </div>

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
                              this.state.cars
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
                  <small>Updated: { this.state.updated } <a style={{cursor:'pointer', padding: '0 1em'}} onClick={ this.update.bind(this) }>refresh</a></small>
                  <div className="list-group">
                    {
                      this.state.cars
                        ? this.state.cars.sort(this.licCompare).map(this.renderListLinkItem.bind(this))
                        : <div className="list-group-item">Loading</div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12" >
              <div className="map-dynamic">
                <GMap
                    markerIcon = { '/images/map/active-waivecar.svg' }
                    markers    = { this.state.cars }
                  />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

};
