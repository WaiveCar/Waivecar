import React   from 'react';
import moment  from 'moment';
import { Map } from 'bento-web';
import { api } from 'bento';

module.exports = class CarsIndex extends React.Component {


  constructor(...options) {
    super(...options);

    this.state = {
      cars : [],
      filter : ""
    };

    this.columns = [
      {key : "license", title:"License", type : "text"},
      {key : "charge", title:"Charge", type : "text"},
      {key : "currentSpeed", title:"Speed", type : "text"},

      {key : "isIgnitionOn", title:"Ignition", type : "bool"},
      {key : "isKeySecure", title:"Key Secure", type : "bool"},
      {key : "isLocked", title:"Locked", type : "bool"},
      {key : "isImmobilized", title:"Immobilized", type : "bool"},
      {key : "isCharging", title:"Charging", type : "bool"},
      {key : "isAvailable", title:"available", type : "bool"},
      {key : "updatedAt", title:"Updated At", type : "datetime"}
    ];
  }

  componentDidMount() {


    api.get(`/cars`, (err, cars) => {
      this.setState( {cars: cars } );
    });


  }

  onFilter(event) {
    this.setState({filter: event.target.value});
  }

  isCarIncludes(car, str) {

    str = str.toLowerCase();
    return this.columns.filter((column) => {
        if (column.type == "text" || column.type == "datetime") {
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
      return <td className="table-col-xs">{ this.renderCheckMark(value )}</td>
    }

    if (column.type == "datetime") {
      let date = moment(value).format('h:mm:ss YY-MM-DD');
      return <td><span>{date}</span></td>
    }

    return <td>{value}</td>
  }

  sort(event) {
    var columnKey = event.target.dataset.title||event.target.parentElement.dataset.title;

    var orderAsc = true;

    if (this.state.sortBy) {
       if (this.state.sortBy.key == columnKey)
         orderAsc = !this.state.sortBy.orderAsc;
    }
    this.setState({
      sortBy : {key : columnKey, orderAsc: orderAsc}
    })
  }

  sortComparator(a, b) {
    var sortBy = this.state.sortBy;
    if (!sortBy)
      return 0;

    if (a[sortBy.key] < b[sortBy.key]) {
      return sortBy.orderAsc ? -1 : 1;
    }

    if (a[sortBy.key] > b[sortBy.key]) {
      return sortBy.orderAsc ? 1 : -1;
    }
    return 0;
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
      <th data-title={column.key} className={className} onClick={ (e) => this.sort(e) } >
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
      <tr className="standard-row">
        {
          this.columns.map((column) => this.renderCell(car, column))
        }
        <td><div className="text-center"><a className="grid-action" href={"/cars/" + car.id}><i className="material-icons" role="edit">edit</i></a></div></td>
      </tr>
    )
  }

  render() {

    return (
      <div className="cars-index" >
        <section className="container" >
          <div className="row">
            <div className="col-xs-12" >
              <div className="ride-map">
                <Map
                  />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12" >
              <div id="table-component" className="component-container" >
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
            </div>
          </div>
        </section>
      </div>
    );
  }

};
