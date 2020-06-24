import React, {Component} from 'react';
import ThSort from '../components/table-th';
import {Link} from 'react-router';
import OrganizationResource from './organization-resource-table.jsx';
import {auth, api} from 'bento';
import {snackbar} from 'bento-web';

class Hub extends Component {
  constructor(props) {
    super(props);
    let {id, hubId} = this.props.params;
    this.state = {
      location: null,
      id,
      hubId,
      showAddCars: false,
      searchResults: [],
      selected: [],
      carSearchWord: '',
    };
    this._user = auth.user();
  }

  componentDidMount() {
    let {id, hubId} = this.state;
    if (!this._user.canSee('organization', {id})) {
      return this.props.history.replaceState({}, '/forbidden');
    }
    api.get(`/locations/${hubId}`, (err, hub) => this.setState({hub}));
  }

  carSearch() {
    let {carSearchWord} = this.state;
    api.get(
      `/cars/search/?search=${carSearchWord}${
        this._user.organizations.length
          ? `&organizationIds=[${this._user.organizations.map(
              org => org.organizationId,
            )}]`
          : ''
      }`,
      (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        this.setState({searchResults: response});
      },
    );
  }

  render() {
    let {
      id,
      hubId,
      showAddCars,
      carSearchWord,
      searchResults,
      selected,
    } = this.state;
    return (
      <div className="box">
        <h3></h3>
        <div className="box-content">
          <button
            className="btn btn-primary"
            onClick={() => this.setState({showAddCars: !showAddCars})}>
            {!showAddCars ? 'Add Cars' : 'hide'}
          </button>
          {showAddCars && (
            <div>
              <div>
                <div className="row" style={{marginTop: '10px'}}>
                  <input
                    onChange={e =>
                      this.setState({carSearchWord: e.target.value})
                    }
                    value={carSearchWord}
                    style={{marginTop: '1px', padding: '2px', height: '40px'}}
                    className="col-xs-6"
                    placeholder="Car Name"
                  />
                  <button
                    className="btn btn-primary btn-sm col-xs-6"
                    onClick={() => this.carSearch()}>
                    Find Car
                  </button>
                </div>
                {searchResults.length
                  ? searchResults.map((item, i) => (
                      <div key={i} className="row">
                        <div style={{padding: '10px 0'}} className="col-xs-6">
                          <Link to={`/cars/${item.id}`} target="_blank">
                            {item.license}
                          </Link>
                        </div>
                        <button
                          className="btn btn-link col-xs-6"
                          onClick={() =>
                            this.setState({
                              selected: !selected.find(
                                car => car.id === item.id,
                              )
                                ? [...selected, item]
                                : selected,
                            })
                          }>
                          {' '}
                          Select
                        </button>
                      </div>
                    ))
                  : ''}
                {selected.length ? (
                  <div>
                    <h4>Selected Cars</h4>
                    {selected.map((item, i) => (
                      <div key={i} className="row">
                        <div style={{padding: '10px 0'}} className="col-xs-6">
                          <Link to={`/cars/${item.id}`} target="_blank">
                            {item.license}
                          </Link>
                        </div>
                        <button
                          className="btn btn-link col-xs-6"
                          onClick={() =>
                            this.setState({
                              selected: selected
                                .slice(0, i)
                                .concat(selected.slice(i + 1)),
                            })
                          }>
                          {' '}
                          Unselect
                        </button>
                      </div>
                    ))}{' '}
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          )}
          <OrganizationResource
            ref="cars-resource"
            resource={'cars'}
            resourceUrl={'carsWithBookings'}
            queryOpts={`&hubId=${hubId}`}
            organizationId={id}
            header={() => (
              <tr ref="sort">
                <ThSort sort="id" value="Id" ctx={this.refs['cars-resource']} />
                <ThSort
                  sort="license"
                  value="Name"
                  ctx={this.refs['cars-resource']}
                />
                <ThSort
                  sort="maintenanceDueIn"
                  value="Maintenance Due In"
                  ctx={this.refs['cars-resource']}
                />
              </tr>
            )}
            row={car => (
              <tr key={car.id}>
                <td>{car.id}</td>
                <td>
                  <Link to={`/cars/${car.id}`}>{car.license}</Link>
                </td>
                <td>{car.maintenanceDueIn} miles</td>
              </tr>
            )}
          />
        </div>
      </div>
    );
  }
}

export default Hub;
