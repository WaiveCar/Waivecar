import React, {Component} from 'react';
import OrganizationResource from '../organizations/organization-resource-table';
import ThSort from '../components/table-th';
import {Link} from 'react-router';
import {auth} from 'bento';
import moment from 'moment';

export default class extends Component {
  constructor(props) {
    super(props);
    this._user = auth.user();
  }

  search(val) {
    let child = this.refs['assets-resource'];
    child.setState({search: val}, () =>
      child.table.search(
        null,
        this.refs['search-input'].value,
        this.refs['search-input'],
      ),
    );
  }

  getCSVFromTable() {
    let toJoin = [];
    let table = document;
    let headerCells = table.querySelectorAll('thead tr th');
    let headerRow = [];
    headerCells.forEach(cell => {
      headerRow.push(cell.textContent.replace('arrow_drop_uparrow_drop_down', ''));
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
    downloadLink.download = 'assets.csv';
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }

  render() {
    return (
      <div className="assets-index box full">
        <section className="container">
          <h3>Assets</h3>
          <div className="box-content">
            <div className="row">
              <div className="col-md-12">
                <input
                  type="text"
                  ref="search-input"
                  onChange={e => this.search({query: e.target.value})}
                  className="form-control box-table-search"
                  placeholder="search"
                />
              </div>
            </div>
            <OrganizationResource
              ref="assets-resource"
              resource={'assets'}
              resourceUrl={'carsWithBookings'}
              organizationIds={this._user.organizations.map(
                org => org.organizationId,
              )}
              requestSize={20}
              header={() => (
                <tr ref="sort">
                  <ThSort
                    sort="id"
                    value="Id"
                    ctx={this.refs['assets-resource']}
                  />
                  <ThSort
                    sort="license"
                    value="Name"
                    ctx={this.refs['assets-resource']}
                  />
                  <ThSort
                    sort="type"
                    value="Type"
                    ctx={this.refs['assets-resource']}
                  />
                  <ThSort
                    sort="organizationName"
                    value="Organization"
                    ctx={this.refs['assets-resource']}
                  />
                  <ThSort
                    sort="updatedAt"
                    value="Last Updated"
                    ctx={this.refs['assets-resource']}
                  />
                </tr>
              )}
              row={car => (
                <tr key={car.id}>
                  <td>
                    <Link to={`/${car.type}s/${car.id}`}>{car.id}</Link>
                  </td>
                  <td>
                    <Link to={`/${car.type}s/${car.id}`}>{car.license}</Link>
                  </td>
                  <td>
                    <Link to={`/${car.type}s`}>{car.type}</Link>
                  </td>
                  <td>
                    {car.organization ? (
                      <Link to={`/organizations/${car.organization.id}`}>
                        {car.organizationName}
                      </Link>
                    ) : (
                      'none'
                    )}
                  </td>
                  <td>{moment(car.updatedAt).format('MM/DD/YYYY HH:MM')}</td>
                </tr>
              )}
            />
          </div>
          <div>
            <button
              className="btn btn-primary get-csv"
              onClick={() => this.getCSVFromTable()}>
              Get CSV
            </button>
          </div>
        </section>
      </div>
    );
  }
}
